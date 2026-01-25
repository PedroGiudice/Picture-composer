# -*- coding: utf-8 -*-
# backend.py
# Modal A100 Inference Pipeline - Picture Composer
# Architecture: VLM (Scene Analysis) -> LLM (Game Master)

import modal
import logging
import json
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

# Importar prompts otimizados
from prompts import (
    VISION_SYSTEM,
    GAME_MASTER_SYSTEM,
    MOSAIC_TITLE_SYSTEM,
    CHAT_BASE_SYSTEM,
    INTENSITY_PROFILES,
    build_vision_user_prompt,
    build_game_master_prompt,
    build_chat_system_prompt,
    build_mosaic_title_prompt,
    parse_challenge_json,
    sanitize_user_input,
)

# Configurar logging estruturado
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger("picture-composer")

# --- Infrastructure Configuration ---
CUDA_VERSION = "12.1.1-devel-ubuntu22.04"

# Model IDs (SOTA Open Models)
VISION_MODEL_ID = "Qwen/Qwen2.5-VL-7B-Instruct"
TEXT_MODEL_ID = "Qwen/Qwen2.5-72B-Instruct-AWQ"


def download_models():
    """Bake model weights into container image at build time."""
    import os
    from huggingface_hub import snapshot_download

    os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"

    print(f"[Build] Downloading Vision Model: {VISION_MODEL_ID}")
    snapshot_download(repo_id=VISION_MODEL_ID)

    print(f"[Build] Downloading Text Model: {TEXT_MODEL_ID}")
    snapshot_download(repo_id=TEXT_MODEL_ID)


image = (
    modal.Image.from_registry(f"nvidia/cuda:{CUDA_VERSION}", add_python="3.11")
    .pip_install(
        "vllm>=0.6.0",
        "torch>=2.1.2",
        "transformers",
        "accelerate",
        "fastapi",
        "pydantic",
        "huggingface_hub",
        "hf_transfer",
        "qwen_vl_utils",
        "pillow",
        "autoawq"
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .run_function(download_models, secrets=[modal.Secret.from_name("huggingface-secret")])
)

app = modal.App("picture-composer-backend-a100")


# --- Data Transfer Objects ---
class InputDTO(BaseModel):
    image_url: str = Field(..., description="URL of the source image")
    heat_level: int = Field(..., ge=1, le=10, description="Challenge intensity (1-10)")
    context: Optional[str] = Field(None, description="Couple's current context (e.g., 'na praia', 'em casa')")


class ChatInputDTO(BaseModel):
    messages: list[dict] = Field(..., description="Chat history: [{'role': 'user/assistant', 'content': '...'}]")
    system_prompt: Optional[str] = Field(None, description="Override for the default system prompt")
    context: Optional[str] = Field(None, description="Couple's current context")


class MosaicInputDTO(BaseModel):
    image_url: str = Field(..., description="URL of the mosaic image")


# --- Vision Engine (Qwen2.5-VL) ---
# VISION_SYSTEM importado de prompts.py


@app.cls(
    gpu="A100",
    image=image,
    scaledown_window=300,
    max_containers=10,
    timeout=900
)
class VisionEngine:
    @modal.enter()
    def load_model(self):
        from vllm import LLM

        print("[VisionEngine] Initializing vLLM...")
        self.llm = LLM(
            model=VISION_MODEL_ID,
            gpu_memory_utilization=0.9,
            max_model_len=8192,
            trust_remote_code=True,
            enforce_eager=True,
            limit_mm_per_prompt={"image": 1}
        )
        print("[VisionEngine] Ready.")

    @modal.method()
    async def analyze_image(self, image_url: str, context: Optional[str] = None) -> str:
        from vllm import SamplingParams

        user_prompt = build_vision_user_prompt(context)

        messages = [
            {"role": "system", "content": VISION_SYSTEM},
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": image_url}},
                {"type": "text", "text": user_prompt}
            ]}
        ]

        # Sampling params otimizados para Qwen
        sampling_params = SamplingParams(
            temperature=0.5,
            top_p=0.9,
            repetition_penalty=1.05,
            max_tokens=1024
        )

        logger.info(f"[VisionEngine] Analyzing image with context: {context}")
        outputs = self.llm.chat(messages=messages, sampling_params=sampling_params)
        result = outputs[0].outputs[0].text
        logger.info(f"[VisionEngine] Analysis complete: {len(result)} chars")
        return result

    @modal.method()
    async def title_mosaic(self, image_url: str) -> str:
        from vllm import SamplingParams

        mosaic_prompt = build_mosaic_title_prompt()

        messages = [
            {"role": "system", "content": MOSAIC_TITLE_SYSTEM},
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": image_url}},
                {"type": "text", "text": mosaic_prompt}
            ]}
        ]

        # Sampling params otimizados para títulos criativos
        sampling_params = SamplingParams(
            temperature=0.8,
            top_p=0.9,
            repetition_penalty=1.2,
            max_tokens=64
        )

        logger.info("[VisionEngine] Generating mosaic title...")
        outputs = self.llm.chat(messages=messages, sampling_params=sampling_params)
        title = outputs[0].outputs[0].text.strip().replace('"', '')
        logger.info(f"[VisionEngine] Title generated: {title}")
        return title


# --- Game Master Engine (Qwen2.5-72B) ---
# INTENSITY_PROFILES, GAME_MASTER_SYSTEM e build_game_master_prompt importados de prompts.py


@app.cls(
    gpu="A100-80GB",
    image=image,
    scaledown_window=300,
    max_containers=10,
    timeout=900
)
class GameMasterEngine:
    @modal.enter()
    def load_model(self):
        from vllm import LLM

        print("[GameMasterEngine] Initializing vLLM...")
        self.llm = LLM(
            model=TEXT_MODEL_ID,
            quantization="awq_marlin",  # Faster than awq, auto-detected compatible
            gpu_memory_utilization=0.85,
            max_model_len=2048,  # Reduced: each photo = independent challenge
            trust_remote_code=True,
            dtype="float16"
        )
        print("[GameMasterEngine] Ready.")

    @modal.method()
    async def generate_challenge(self, visual_description: str, heat_level: int, couple_context: Optional[str] = None) -> Dict[str, Any]:
        from vllm import SamplingParams

        # Construir prompt usando função do prompts.py
        system_prompt = build_game_master_prompt(visual_description, heat_level, couple_context)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Crie o desafio agora. Responda apenas com o JSON."}
        ]

        # Sampling params otimizados para Qwen - criatividade balanceada
        sampling_params = SamplingParams(
            temperature=0.7,
            top_p=0.8,
            repetition_penalty=1.1,
            max_tokens=1024
            # Removido stop=["```"] - conflitava com instrução de JSON puro
        )

        logger.info(f"[GameMasterEngine] Generating challenge for heat_level={heat_level}")
        outputs = self.llm.chat(messages=messages, sampling_params=sampling_params)
        generated_text = outputs[0].outputs[0].text
        logger.info(f"[GameMasterEngine] Raw response: {generated_text[:200]}...")

        # Parse robusto usando função do prompts.py
        result = parse_challenge_json(generated_text, heat_level)
        logger.info(f"[GameMasterEngine] Challenge generated: {result.get('challenge_title', 'N/A')}")
        return result

    @modal.method()
    async def chat(self, messages: list[dict], system_prompt: Optional[str] = None, context: Optional[str] = None) -> str:
        """Direct chat with the Game Master for contextual conversations."""
        from vllm import SamplingParams

        # Build system prompt usando função do prompts.py
        if system_prompt:
            # Se foi passado um system prompt customizado, usar ele
            base_prompt = system_prompt
            if context:
                safe_context = sanitize_user_input(context)
                base_prompt += f"\n\nCONTEXTO ATUAL DO CASAL: {safe_context}"
        else:
            # Usar função que já sanitiza o contexto
            base_prompt = build_chat_system_prompt(context)

        # Prepare chat messages
        chat_messages = [{"role": "system", "content": base_prompt}] + messages

        # Sampling params otimizados para chat
        sampling_params = SamplingParams(
            temperature=0.8,
            top_p=0.9,
            repetition_penalty=1.05,
            max_tokens=1024
        )

        logger.info(f"[GameMasterEngine] Processing chat with {len(messages)} messages")
        outputs = self.llm.chat(messages=chat_messages, sampling_params=sampling_params)
        response = outputs[0].outputs[0].text
        logger.info(f"[GameMasterEngine] Chat response: {len(response)} chars")
        return response


# --- API Endpoints ---
@app.function(image=image, timeout=900)
@modal.fastapi_endpoint(method="POST")
async def process_intimacy_request(data: InputDTO) -> Dict[str, Any]:
    """Main endpoint: Image -> Visual Analysis -> Challenge Generation"""

    logger.info(f"[API] Processing intimacy request: heat_level={data.heat_level}")

    vision = VisionEngine()
    logger.info("[API] Requesting visual analysis...")
    visual_description = await vision.analyze_image.remote.aio(data.image_url, data.context)

    game_master = GameMasterEngine()
    logger.info("[API] Generating challenge...")
    result = await game_master.generate_challenge.remote.aio(
        visual_description,
        data.heat_level,
        data.context
    )

    logger.info(f"[API] Request complete: {result.get('challenge_title', 'N/A')}")
    return result


@app.function(image=image, timeout=900)
@modal.fastapi_endpoint(method="POST")
async def chat_with_game_master(data: ChatInputDTO) -> Dict[str, Any]:
    """Chat directly with the GameMaster for contextual adjustments and conversations."""

    logger.info(f"[API] Processing chat request: {len(data.messages)} messages")

    game_master = GameMasterEngine()
    response = await game_master.chat.remote.aio(
        data.messages,
        data.system_prompt,
        data.context
    )

    logger.info("[API] Chat request complete")
    return {"response": response}


@app.function(image=image, timeout=900)
@modal.fastapi_endpoint(method="POST")
async def process_mosaic_request(data: MosaicInputDTO) -> Dict[str, Any]:
    """Generate a poetic title for a mosaic image."""

    logger.info("[API] Processing mosaic title request...")

    vision = VisionEngine()
    title = await vision.title_mosaic.remote.aio(data.image_url)

    logger.info(f"[API] Mosaic title complete: {title}")
    return {"title": title}
