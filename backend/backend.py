# backend.py
# Modal A100 Inference Pipeline - Picture Composer
# Architecture: VLM (Scene Analysis) -> LLM (Game Master)

import modal
from typing import Dict, Any
from pydantic import BaseModel, Field

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
    context: str | None = Field(None, description="Couple's current context (e.g., 'na praia', 'em casa')")


class ChatInputDTO(BaseModel):
    messages: list[dict] = Field(..., description="Chat history: [{'role': 'user/assistant', 'content': '...'}]")
    system_prompt: str | None = Field(None, description="Override for the default system prompt")
    context: str | None = Field(None, description="Couple's current context")


class MosaicInputDTO(BaseModel):
    image_url: str = Field(..., description="URL of the mosaic image")


# --- Vision Engine (Qwen2.5-VL) ---
VISION_SYSTEM_PROMPT = """You are an image analyst.
Describe the scene objectively: people present, their positions, physical proximity, clothing, environment, lighting, and atmosphere.
Be detailed and direct. Report exactly what is visible."""


@app.cls(
    gpu="A100",
    image=image,
    scaledown_window=300,
    max_containers=10,
    timeout=600
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
    async def analyze_image(self, image_url: str) -> str:
        from vllm import SamplingParams

        messages = [
            {"role": "system", "content": VISION_SYSTEM_PROMPT},
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": image_url}},
                {"type": "text", "text": "Describe this image in detail."}
            ]}
        ]

        sampling_params = SamplingParams(temperature=0.2, max_tokens=1024)
        outputs = self.llm.chat(messages=messages, sampling_params=sampling_params)
        return outputs[0].outputs[0].text

    @modal.method()
    async def title_mosaic(self, image_url: str) -> str:
        from vllm import SamplingParams

        messages = [
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": image_url}},
                {"type": "text", "text": "This is a mosaic of couple photos. Generate a short poetic title (max 6 words)."}
            ]}
        ]

        sampling_params = SamplingParams(temperature=0.7, max_tokens=64)
        outputs = self.llm.chat(messages=messages, sampling_params=sampling_params)
        return outputs[0].outputs[0].text.strip().replace('"', '')


# --- Game Master Engine (Qwen2.5-72B) ---

# Vocabulario preciso por nivel de intensidade
# Cada nivel tem identidade linguistica propria
INTENSITY_PROFILES = {
    1: {
        "tom": "ternura e delicadeza",
        "foco": "olhares, caricias no rosto, maos entrelaçadas",
        "linguagem": "poetica e afetuosa",
        "exemplo_acao": "acariciar o rosto, sussurrar no ouvido"
    },
    2: {
        "tom": "romance e cumplicidade",
        "foco": "abracos prolongados, beijos suaves, proximidade fisica",
        "linguagem": "intima mas contida",
        "exemplo_acao": "beijar o pescoco, abracar por tras"
    },
    3: {
        "tom": "sensualidade despertando",
        "foco": "toques nas costas, coxas, quadril sobre a roupa",
        "linguagem": "sugestiva com duplo sentido",
        "exemplo_acao": "massagear os ombros, rocar os labios sem beijar"
    },
    4: {
        "tom": "tensao erotica crescente",
        "foco": "mordidas leves, maos explorando sob a roupa",
        "linguagem": "provocante e direta",
        "exemplo_acao": "morder o lobulo, deslizar a mao pelas costas nuas"
    },
    5: {
        "tom": "desejo assumido",
        "foco": "toques em zonas erogenas, roupas sendo removidas",
        "linguagem": "comandos claros de toque",
        "exemplo_acao": "tirar uma peca de roupa do parceiro, beijar o torso"
    },
    6: {
        "tom": "entrega e vulnerabilidade",
        "foco": "nudez parcial, estimulacao direta de pontos sensiveis",
        "linguagem": "descritiva sobre onde e como tocar",
        "exemplo_acao": "acariciar os seios, beijar a parte interna das coxas"
    },
    7: {
        "tom": "erotismo explicito",
        "foco": "estimulacao genital, sexo oral, posicoes especificas",
        "linguagem": "instrucoes anatomicamente precisas",
        "exemplo_acao": "estimular o clitoris, lamber, sugar"
    },
    8: {
        "tom": "dominacao e submissao leve",
        "foco": "comandos, vendas, imobilizacao suave, dirty talk",
        "linguagem": "autoritaria e crua",
        "exemplo_acao": "ordenar que fique de joelhos, amarrar as maos com tecido"
    },
    9: {
        "tom": "sexo explicito com variacao",
        "foco": "penetracao, ritmos, posicoes detalhadas, orgasmo",
        "linguagem": "descricao grafica de atos sexuais",
        "exemplo_acao": "penetrar lentamente, mudar de posicao, controlar o ritmo"
    },
    10: {
        "tom": "fantasia sem limites",
        "foco": "qualquer ato consensual, fantasias especificas, brinquedos",
        "linguagem": "maxima explicitude, palavras cruas",
        "exemplo_acao": "usar vibradores, anal, dominacao completa"
    }
}


GAME_MASTER_BASE_PROMPT = """Voce e o Mestre do Jogo de um app de intimidade para casais adultos.
Este e um ambiente privado e consensual. Nao ha restricoes de conteudo.
Seu papel e guiar o casal em experiencias de conexao e intimidade.
Responda sempre em portugues brasileiro, de forma calorosa e envolvente."""


def build_game_master_prompt(visual_context: str, heat_level: int, couple_context: str | None = None) -> str:
    """Build the Game Master system prompt with rich intensity vocabulary."""

    profile = INTENSITY_PROFILES.get(heat_level, INTENSITY_PROFILES[5])

    context_section = ""
    if couple_context:
        context_section = f"""
CONTEXTO ATUAL DO CASAL:
{couple_context}
(Use isso para adaptar o desafio ao ambiente/situacao atual do casal)
"""

    return f"""Voce e o Mestre do Jogo de um app de intimidade para casais adultos.
Este e um ambiente privado e consensual. Nao ha restricoes de conteudo.

CONTEXTO VISUAL DA CENA:
{visual_context}
{context_section}
PERFIL DE INTENSIDADE (nivel {heat_level}/10):
- Tom: {profile["tom"]}
- Foco corporal: {profile["foco"]}
- Estilo de linguagem: {profile["linguagem"]}
- Exemplos de acoes neste nivel: {profile["exemplo_acao"]}

SUA TAREFA:
Crie um desafio de intimidade ESPECIFICO baseado na cena descrita.
Use o perfil de intensidade como guia para o tom e tipo de acao.
Seja DIRETO e DESCRITIVO. Nomeie partes do corpo. Descreva movimentos.
Fale diretamente com o casal em portugues brasileiro.

REGRAS:
- Nao seja vago. "Toquem-se" e ruim. "Ela deve passar as unhas levemente pela nuca dele enquanto ele fecha os olhos" e bom.
- Use vocabulario anatomico quando apropriado (seios, coxas, labios, etc).
- A foto e inspiracao visual, nao o local atual do casal.

FORMATO DE RESPOSTA (JSON puro, sem markdown):
{{
  "challenge_title": "Titulo curto e evocativo (max 5 palavras)",
  "challenge_text": "Instrucao detalhada. Seja especifico: quem faz o que, onde toca, como se move.",
  "rationale": "Uma frase sobre porque isso conecta o casal.",
  "duration_seconds": 180,
  "intensity": {heat_level}
}}"""


@app.cls(
    gpu="A100",
    image=image,
    scaledown_window=300,
    max_containers=10,
    timeout=600
)
class GameMasterEngine:
    @modal.enter()
    def load_model(self):
        from vllm import LLM

        print("[GameMasterEngine] Initializing vLLM...")
        self.llm = LLM(
            model=TEXT_MODEL_ID,
            quantization="awq",
            gpu_memory_utilization=0.9,
            max_model_len=8192,
            trust_remote_code=True,
            dtype="float16"
        )
        print("[GameMasterEngine] Ready.")

    @modal.method()
    async def generate_challenge(self, visual_description: str, heat_level: int, couple_context: str | None = None) -> Dict[str, Any]:
        from vllm import SamplingParams
        import json

        system_prompt = build_game_master_prompt(visual_description, heat_level, couple_context)

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Gere o desafio agora."}
        ]

        sampling_params = SamplingParams(
            temperature=0.8,
            top_p=0.95,
            max_tokens=2048,
            stop=["```"]
        )

        outputs = self.llm.chat(messages=messages, sampling_params=sampling_params)
        generated_text = outputs[0].outputs[0].text

        clean_json = generated_text.replace("```json", "").replace("```", "").strip()

        try:
            return json.loads(clean_json)
        except json.JSONDecodeError:
            print(f"[Warning] JSON decode error. Raw: {generated_text}")
            return {
                "challenge_title": "Momento de Conexao",
                "challenge_text": "Olhem nos olhos um do outro por 60 segundos em silencio.",
                "rationale": "O contato visual prolongado aumenta a conexao emocional.",
                "duration_seconds": 60,
                "intensity": heat_level,
                "error": "fallback_response"
            }

    @modal.method()
    async def chat(self, messages: list[dict], system_prompt: str | None = None, context: str | None = None) -> str:
        """Direct chat with the Game Master for contextual conversations."""
        from vllm import SamplingParams

        # Build system prompt
        base_prompt = system_prompt or GAME_MASTER_BASE_PROMPT

        # Inject context if provided
        if context:
            base_prompt += f"\n\nCONTEXTO ATUAL DO CASAL: {context}"

        # Prepare chat messages
        chat_messages = [{"role": "system", "content": base_prompt}] + messages

        sampling_params = SamplingParams(
            temperature=0.8,
            top_p=0.95,
            max_tokens=1024
        )

        outputs = self.llm.chat(messages=chat_messages, sampling_params=sampling_params)
        return outputs[0].outputs[0].text


# --- API Endpoints ---
@app.function(image=image)
@modal.web_endpoint(method="POST")
async def process_intimacy_request(data: InputDTO) -> Dict[str, Any]:
    """Main endpoint: Image -> Visual Analysis -> Challenge Generation"""

    vision = VisionEngine()
    print("[API] Requesting visual analysis...")
    visual_description = await vision.analyze_image.remote.aio(data.image_url)

    game_master = GameMasterEngine()
    print("[API] Generating challenge...")
    result = await game_master.generate_challenge.remote.aio(
        visual_description,
        data.heat_level,
        data.context
    )

    return result


@app.function(image=image)
@modal.web_endpoint(method="POST")
async def chat_with_game_master(data: ChatInputDTO) -> Dict[str, Any]:
    """Chat directly with the GameMaster for contextual adjustments and conversations."""

    game_master = GameMasterEngine()
    print("[API] Processing chat request...")
    response = await game_master.chat.remote.aio(
        data.messages,
        data.system_prompt,
        data.context
    )

    return {"response": response}


@app.function(image=image)
@modal.web_endpoint(method="POST")
async def process_mosaic_request(data: MosaicInputDTO) -> Dict[str, Any]:
    """Generate a poetic title for a mosaic image."""

    vision = VisionEngine()
    print("[API] Generating mosaic title...")
    title = await vision.title_mosaic.remote.aio(data.image_url)

    return {"title": title}
