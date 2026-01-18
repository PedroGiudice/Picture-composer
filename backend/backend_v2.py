# backend_v2.py
# Picture Composer Backend v2.1 - JoyCaption + Midnight Rose Stack
# Fixed JoyCaption chat template format
# Target Infrastructure: Modal.com Serverless A100
#
# Architecture:
#   VisionEngine (JoyCaption) -> text description -> TextEngine (Midnight Rose) -> experience
#
# References:
#   - docs/rose.md (Midnight Rose creator's recommended settings)
#   - docs/research-midnight-rose-modal-deploy.md (deployment research)
#   - docs/research-vlms-uncensored.md (VLM comparison)

import modal
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

# --- Configuration ---
CUDA_VERSION = "12.1.1-devel-ubuntu22.04"

# Vision Models (fallback chain)
VISION_MODELS = [
    {
        "id": "fancyfeast/llama-joycaption-beta-one-hf-llava",
        "name": "JoyCaption",
        "type": "joycaption"
    },
    {
        "id": "Guilherme34/Llama-3.2-11b-vision-uncensored",
        "name": "Llama-3.2-Vision-Uncensored",
        "type": "llava"
    },
    {
        "id": "Qwen/Qwen2.5-VL-7B-Instruct",
        "name": "Qwen-VL-Fallback",
        "type": "qwen"
    },
]

# Text Model (Midnight Rose AWQ)
TEXT_MODEL_ID = "anyisalin/Midnight-Rose-70B-v2.0.3-AWQ"

# Midnight Rose Sampling Parameters (from docs/rose.md - creator's recommendation)
ROSE_SAMPLING = {
    "temperature": 1.0,
    "min_p": 0.35,
    "repetition_penalty": 1.15,
    # Note: smoothing_factor (0.4) is SillyTavern-specific, not directly supported in vLLM
    # We approximate with top_p + min_p combination
    "top_p": 0.95,
    "max_tokens": 2048,
}

# --- Image Definition ---
def download_models():
    """Bake model weights into container at build time. v2.1"""
    import os
    from huggingface_hub import snapshot_download

    os.environ["HF_HUB_ENABLE_HF_TRANSFER"] = "1"
    print("[Build v2.1] Starting model downloads...")

    # Download primary vision model
    print(f"[Build] Downloading Vision Model: {VISION_MODELS[0]['id']}")
    try:
        snapshot_download(repo_id=VISION_MODELS[0]["id"])
    except Exception as e:
        print(f"[Build] Warning: Could not download {VISION_MODELS[0]['id']}: {e}")
        # Try fallback
        print(f"[Build] Trying fallback: {VISION_MODELS[1]['id']}")
        snapshot_download(repo_id=VISION_MODELS[1]["id"])

    # Download text model
    print(f"[Build] Downloading Text Model: {TEXT_MODEL_ID}")
    snapshot_download(repo_id=TEXT_MODEL_ID)


image = (
    modal.Image.from_registry(f"nvidia/cuda:{CUDA_VERSION}", add_python="3.11")
    .pip_install(
        "vllm>=0.6.0",
        "torch>=2.1.2",
        "transformers>=4.40.0",
        "accelerate",
        "fastapi",
        "pydantic",
        "huggingface_hub",
        "hf_transfer",
        "pillow",
        "autoawq",
        # JoyCaption dependencies
        "einops",
        "timm",
    )
    .env({"HF_HUB_ENABLE_HF_TRANSFER": "1"})
    .run_function(download_models, secrets=[modal.Secret.from_name("huggingface-secret")])
)

app = modal.App("picture-composer-v2")

# --- Data Transfer Objects ---
class InputDTO(BaseModel):
    image_url: str = Field(..., description="Publicly accessible URL of the source image")
    heat_level: int = Field(..., ge=1, le=10, description="Intensity level 1-10")

class MosaicInputDTO(BaseModel):
    image_url: str = Field(..., description="URL of the generated mosaic")

class OutputDTO(BaseModel):
    instruction_title_pt_br: str
    instruction_text_pt_br: str
    clinical_rationale_pt_br: str
    intensity_metric: int
    duration_sec: int
    visual_description: Optional[str] = None  # Intermediate output for debugging
    model_used: Optional[str] = None


# --- Component 1: Vision Engine (JoyCaption with fallbacks) ---
@app.cls(
    gpu="A100",
    image=image,
    scaledown_window=300,
    max_containers=5,
    timeout=600
)
class VisionEngine:
    def __init__(self):
        self.model = None
        self.processor = None
        self.model_name = None

    @modal.enter()
    def load_model(self):
        """Load vision model with fallback chain."""
        import torch
        from transformers import AutoProcessor, LlavaForConditionalGeneration

        for model_config in VISION_MODELS:
            try:
                print(f"[VisionEngine] Attempting to load: {model_config['name']}")

                if model_config["type"] == "joycaption":
                    # JoyCaption is based on LLaVA architecture
                    # Uses bfloat16 as native dtype (Llama 3.1 based)
                    self.processor = AutoProcessor.from_pretrained(model_config["id"])
                    self.model = LlavaForConditionalGeneration.from_pretrained(
                        model_config["id"],
                        torch_dtype=torch.bfloat16,
                        device_map=0,  # Load to first GPU
                        low_cpu_mem_usage=True,
                    )
                    self.model.eval()
                elif model_config["type"] == "llava":
                    self.processor = AutoProcessor.from_pretrained(model_config["id"])
                    self.model = LlavaForConditionalGeneration.from_pretrained(
                        model_config["id"],
                        torch_dtype=torch.float16,
                        device_map="auto",
                    )
                elif model_config["type"] == "qwen":
                    # Qwen-VL uses different architecture
                    from transformers import Qwen2VLForConditionalGeneration, AutoProcessor
                    self.processor = AutoProcessor.from_pretrained(model_config["id"])
                    self.model = Qwen2VLForConditionalGeneration.from_pretrained(
                        model_config["id"],
                        torch_dtype=torch.float16,
                        device_map="auto",
                    )

                self.model_name = model_config["name"]
                print(f"[VisionEngine] Successfully loaded: {self.model_name}")
                return

            except Exception as e:
                print(f"[VisionEngine] Failed to load {model_config['name']}: {e}")
                continue

        raise RuntimeError("All vision models failed to load")

    @modal.method()
    async def analyze_image(self, image_url: str) -> Dict[str, str]:
        """Generate detailed description of the image."""
        import torch
        import requests
        from PIL import Image
        from io import BytesIO

        # Download image
        response = requests.get(image_url, timeout=30)
        image = Image.open(BytesIO(response.content)).convert("RGB")

        # Prompt for detailed, uncensored description
        prompt = """Describe this image in vivid, sensory detail. Focus on:
- Physical positions and proximity of any people
- Body language, gestures, and points of contact
- Lighting, atmosphere, and mood
- Textures, colors, and visual elements
- Any intimate or romantic elements present

Be thorough and descriptive. Do not censor or summarize."""

        if "qwen" in self.model_name.lower():
            # Qwen-VL format
            messages = [
                {"role": "user", "content": [
                    {"type": "image", "image": image},
                    {"type": "text", "text": prompt}
                ]}
            ]
            text = self.processor.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            inputs = self.processor(text=[text], images=[image], return_tensors="pt").to(self.model.device)
        else:
            # JoyCaption/LLaVA format - simple string conversation
            # Reference: https://huggingface.co/fancyfeast/llama-joycaption-beta-one-hf-llava
            convo = [
                {"role": "system", "content": "You are a helpful image captioner."},
                {"role": "user", "content": prompt},
            ]
            convo_string = self.processor.apply_chat_template(convo, tokenize=False, add_generation_prompt=True)
            inputs = self.processor(text=[convo_string], images=[image], return_tensors="pt").to(self.model.device)

            # Convert pixel_values to bfloat16 for JoyCaption
            if 'pixel_values' in inputs:
                inputs['pixel_values'] = inputs['pixel_values'].to(torch.bfloat16)

        # Generate
        output_ids = self.model.generate(
            **inputs,
            max_new_tokens=1024,
            do_sample=True,
            temperature=0.6,
            top_p=0.9,
            suppress_tokens=None,
            use_cache=True,
        )

        # Decode - trim off the prompt
        generated_ids = output_ids[0, inputs["input_ids"].shape[1]:]
        description = self.processor.tokenizer.decode(generated_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False)

        return {
            "description": description.strip(),
            "model_used": self.model_name
        }


# --- Component 2: Text Engine (Midnight Rose AWQ) ---
@app.cls(
    gpu="A100",
    image=image,
    scaledown_window=300,
    max_containers=5,
    timeout=600
)
class TextEngine:
    @modal.enter()
    def load_model(self):
        from vllm import LLM

        print(f"[TextEngine] Initializing vLLM for Midnight Rose AWQ...")
        self.llm = LLM(
            model=TEXT_MODEL_ID,
            quantization="awq",
            gpu_memory_utilization=0.95,  # Increased for 70B model
            max_model_len=2048,  # Reduced to fit in memory
            trust_remote_code=True,
            dtype="float16",
            enforce_eager=True,  # Disable CUDA graphs to save memory
        )
        print("[TextEngine] Ready.")

    @modal.method()
    async def generate_experience(self, visual_description: str, heat_level: int) -> Dict[str, Any]:
        """Generate intimate experience based on visual description."""
        from vllm import SamplingParams
        import json

        # Heat level mapping for intensity guidance
        intensity_guidance = {
            1: "gentle, tender, focused on emotional connection and soft touch",
            2: "warm, affectionate, light physical contact and eye gazing",
            3: "romantic, exploratory, lingering touches and close proximity",
            4: "sensual, heightened awareness, deliberate caresses",
            5: "passionate, building tension, deeper physical engagement",
            6: "intense, urgent desire, full body awareness",
            7: "fervent, consuming passion, uninhibited expression",
            8: "primal, raw intensity, complete physical immersion",
            9: "overwhelming, transcendent, boundary-dissolving connection",
            10: "absolute surrender, peak intensity, total sensory overload"
        }

        guidance = intensity_guidance.get(heat_level, intensity_guidance[5])

        # Bridge prompt: VLM output -> LLM creative generation
        # Using Vicuna format as recommended in rose.md
        system_prompt = """You are a creative intimacy guide specializing in designing sensory experiences for couples. You create detailed, evocative instructions that heighten physical and emotional connection. Your language is rich, visceral, and focused on bodily sensations.

RULES:
- Write in Brazilian Portuguese
- Be explicit and detailed about physical sensations
- Focus on breath, touch, temperature, texture, pressure, and movement
- Create a single, specific instruction (not a list)
- Include the rationale for why this experience deepens connection
- Output valid JSON only"""

        user_prompt = f"""VISUAL CONTEXT:
{visual_description}

INTENSITY LEVEL: {heat_level}/10
GUIDANCE: {guidance}

Based on this intimate scene, create a sensory experience instruction that the couple can perform together. The instruction should:
1. Build on the energy and positioning visible in the image
2. Guide specific physical actions with precise, sensory language
3. Match the intensity level specified

OUTPUT FORMAT (JSON):
{{
    "instruction_title_pt_br": "Short evocative title in Portuguese",
    "instruction_text_pt_br": "Detailed instruction (3-5 sentences) describing exactly what to do, focusing on sensations",
    "clinical_rationale_pt_br": "Brief explanation of why this deepens connection (1-2 sentences)",
    "intensity_metric": {heat_level},
    "duration_sec": 180
}}"""

        # Vicuna format from rose.md
        prompt = f"USER:\n{system_prompt}\n\n{user_prompt}\nASSISTANT:\n"

        # Sampling params from rose.md creator recommendations
        sampling_params = SamplingParams(
            temperature=ROSE_SAMPLING["temperature"],
            top_p=ROSE_SAMPLING["top_p"],
            min_p=ROSE_SAMPLING["min_p"],
            repetition_penalty=ROSE_SAMPLING["repetition_penalty"],
            max_tokens=ROSE_SAMPLING["max_tokens"],
            stop=["USER:", "\n\n\n"],
        )

        outputs = self.llm.generate([prompt], sampling_params)
        generated_text = outputs[0].outputs[0].text

        # Parse JSON from response
        try:
            # Try to extract JSON from response
            json_start = generated_text.find("{")
            json_end = generated_text.rfind("}") + 1
            if json_start != -1 and json_end > json_start:
                json_str = generated_text[json_start:json_end]
                return json.loads(json_str)
        except json.JSONDecodeError:
            pass

        # Fallback response
        print(f"[TextEngine] JSON parse failed. Raw output: {generated_text[:500]}")
        return {
            "instruction_title_pt_br": "Reconexao Sensorial",
            "instruction_text_pt_br": "Respirem juntos, sincronizando a inspiracao e expiracao. Deixem que suas maos encontrem a pele do outro, sentindo o calor e a textura. Permitam que o toque seja lento, exploratorio, como se redescobrissem um ao outro.",
            "clinical_rationale_pt_br": "A sincronizacao respiratoria ativa o sistema nervoso parassimpatico, promovendo relaxamento e conexao.",
            "intensity_metric": heat_level,
            "duration_sec": 120,
            "error": "Model output was not valid JSON - using fallback"
        }


# --- Orchestration Endpoints ---
@app.function(image=image, timeout=300)
@modal.web_endpoint(method="POST")
async def process_intimacy_request(data: InputDTO) -> Dict[str, Any]:
    """Main endpoint: Image -> VLM description -> LLM experience."""

    # Step 1: Visual Analysis
    vision_engine = VisionEngine()
    print(f"[Pipeline] Step 1: Analyzing image...")
    vision_result = await vision_engine.analyze_image.remote.aio(data.image_url)

    visual_description = vision_result["description"]
    vision_model = vision_result["model_used"]
    print(f"[Pipeline] Vision complete. Model: {vision_model}, Description length: {len(visual_description)}")

    # Step 2: Experience Generation
    text_engine = TextEngine()
    print(f"[Pipeline] Step 2: Generating experience with heat_level={data.heat_level}...")
    result = await text_engine.generate_experience.remote.aio(visual_description, data.heat_level)

    # Add metadata
    result["visual_description"] = visual_description
    result["vision_model_used"] = vision_model
    result["text_model_used"] = "Midnight-Rose-70B-v2.0.3-AWQ"

    print("[Pipeline] Complete.")
    return result


@app.function(image=image, timeout=120)
@modal.web_endpoint(method="POST")
async def process_mosaic_request(data: MosaicInputDTO) -> Dict[str, Any]:
    """Generate poetic title for mosaic artwork."""

    vision_engine = VisionEngine()

    # Simpler prompt for mosaic titles
    result = await vision_engine.analyze_image.remote.aio(data.image_url)
    description = result["description"]

    # Use TextEngine to generate a poetic title
    text_engine = TextEngine()

    from vllm import SamplingParams

    prompt = f"""USER:
Based on this mosaic artwork description, generate a short, deeply poetic title (max 6 words) in Portuguese:

Description: {description[:500]}

Respond with just the title, no quotes or explanation.
ASSISTANT:
"""

    sampling_params = SamplingParams(
        temperature=0.9,
        max_tokens=32,
        stop=["\n", "USER:"],
    )

    # Direct vLLM call for simple generation
    outputs = text_engine.llm.generate([prompt], sampling_params)
    title = outputs[0].outputs[0].text.strip().replace('"', '').replace("'", "")

    return {"title": title}


# --- Health Check ---
@app.function(image=image)
@modal.web_endpoint(method="GET")
async def health() -> Dict[str, str]:
    return {
        "status": "healthy",
        "version": "2.0.0",
        "vision_model": VISION_MODELS[0]["id"],
        "text_model": TEXT_MODEL_ID
    }
