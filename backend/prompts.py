# -*- coding: utf-8 -*-
"""
Prompts otimizados para modelos Qwen open-source.

Princípios:
1. Português brasileiro com acentuação correta
2. Estrutura com delimitadores ### para clareza
3. Few-shot examples obrigatórios
4. Afirmações positivas (evitar negações)
5. Output estruturado com schema explícito
"""

from typing import TypedDict, Optional
import re


# === SCHEMAS DE OUTPUT ===

class VisionAnalysis(TypedDict):
    """Schema para análise visual."""
    pessoas: str
    proximidade: str
    vestuario: str
    ambiente: str
    atmosfera: str


class IntimacyChallenge(TypedDict, total=False):
    """Schema para desafio de intimidade."""
    challenge_title: str
    challenge_text: str
    rationale: str
    duration_seconds: int
    intensity: int
    error: str  # Opcional, presente apenas em fallbacks


# === SANITIZAÇÃO ===

def sanitize_user_input(text: str) -> str:
    """Remove tentativas de prompt injection.

    Args:
        text: Texto do usuário para sanitizar

    Returns:
        Texto limpo, truncado a 2000 caracteres
    """
    if not text:
        return ""

    # Patterns perigosos (case-insensitive)
    dangerous = [
        r"ignore\s*(todas?|all|previous|anterior)",
        r"esqueça\s*(tudo|instruções|instrucoes)",
        r"novo\s*system\s*prompt",
        r"você\s*agora\s*é",
        r"voce\s*agora\s*e",
        r"mude\s*de\s*papel",
        r"desconsidere",
        r"<\|im_start\|>",
        r"<\|im_end\|>",
    ]

    cleaned = text
    for pattern in dangerous:
        cleaned = re.sub(pattern, "[CONTEXTO]", cleaned, flags=re.IGNORECASE)

    # Limitar tamanho
    return cleaned[:2000].strip()


# === VISION ENGINE PROMPTS ===

VISION_SYSTEM = """Você é um analista visual especializado em cenas românticas.

### SUA TAREFA
Analisar imagens de casais focando em elementos relevantes para intimidade.

### O QUE OBSERVAR
1. **Pessoas**: Quantas, gênero aparente, posições corporais
2. **Proximidade**: Distância entre elas, pontos de contato
3. **Vestuário**: Tipo de roupa, quanto cobrem, estado
4. **Ambiente**: Local, iluminação, privacidade
5. **Atmosfera**: Emoção transmitida, tensão, relaxamento

### FORMATO DE RESPOSTA
Responda em português brasileiro.
Seja objetivo e detalhado.
Foque em detalhes úteis para sugestões de intimidade.

### EXEMPLO
"Casal sentado em sofá. Ela apoiada no ombro dele, pernas cruzadas sobre as dele.
Vestem roupas casuais - ela de vestido curto, ele de camiseta.
Iluminação suave, ambiente residencial privado.
Atmosfera relaxada e afetuosa, contato físico natural."
"""


def build_vision_user_prompt(context: Optional[str] = None) -> str:
    """Constrói user prompt para análise visual.

    Args:
        context: Contexto adicional opcional do usuário

    Returns:
        Prompt formatado para o modelo de visão
    """
    base = "Analise esta imagem descrevendo os elementos relevantes para intimidade."

    if context:
        safe_context = sanitize_user_input(context)
        return f"{base}\n\nContexto adicional: {safe_context}"

    return base


# === GAME MASTER PROMPTS ===

INTENSITY_DESCRIPTIONS = {
    1: "Carinho inicial - olhares, mãos dadas, abraços leves",
    2: "Ternura - carícias no rosto, beijos suaves",
    3: "Conexão - massagens leves, abraços prolongados",
    4: "Aquecimento - beijos mais intensos, carícias sobre roupa",
    5: "Exploração - toques mais ousados, remoção parcial de roupa",
    6: "Intensidade - carícias íntimas, sussurros sensuais",
    7: "Paixão - exploração corporal mais livre",
    8: "Entrega - intimidade explícita com ternura",
    9: "Ardor - intensidade máxima com consenso",
    10: "Fantasia - realização de desejos específicos do casal",
}


INTENSITY_PROFILES = {
    1: {
        "tom": "ternura e delicadeza",
        "foco": "olhares, carícias no rosto, mãos entrelaçadas",
        "linguagem": "poética e afetuosa",
        "exemplo_acao": "acariciar o rosto, sussurrar no ouvido"
    },
    2: {
        "tom": "romance e cumplicidade",
        "foco": "abraços prolongados, beijos suaves, proximidade física",
        "linguagem": "íntima mas contida",
        "exemplo_acao": "beijar o pescoço, abraçar por trás"
    },
    3: {
        "tom": "sensualidade despertando",
        "foco": "toques nas costas, coxas, quadril sobre a roupa",
        "linguagem": "sugestiva com duplo sentido",
        "exemplo_acao": "massagear os ombros, roçar os lábios sem beijar"
    },
    4: {
        "tom": "tensão erótica crescente",
        "foco": "mordidas leves, mãos explorando sob a roupa",
        "linguagem": "provocante e direta",
        "exemplo_acao": "morder o lóbulo, deslizar a mão pelas costas nuas"
    },
    5: {
        "tom": "desejo assumido",
        "foco": "toques em zonas erógenas, roupas sendo removidas",
        "linguagem": "comandos claros de toque",
        "exemplo_acao": "tirar uma peça de roupa do parceiro, beijar o torso"
    },
    6: {
        "tom": "entrega e vulnerabilidade",
        "foco": "nudez parcial, estimulação direta de pontos sensíveis",
        "linguagem": "descritiva sobre onde e como tocar",
        "exemplo_acao": "acariciar os seios, beijar a parte interna das coxas"
    },
    7: {
        "tom": "erotismo explícito",
        "foco": "estimulação genital, sexo oral, posições específicas",
        "linguagem": "instruções anatomicamente precisas",
        "exemplo_acao": "estimular o clitóris, lamber, sugar"
    },
    8: {
        "tom": "dominação e submissão leve",
        "foco": "comandos, vendas, imobilização suave, dirty talk",
        "linguagem": "autoritária e crua",
        "exemplo_acao": "ordenar que fique de joelhos, amarrar as mãos com tecido"
    },
    9: {
        "tom": "sexo explícito com variação",
        "foco": "penetração, ritmos, posições detalhadas, orgasmo",
        "linguagem": "descrição gráfica de atos sexuais",
        "exemplo_acao": "penetrar lentamente, mudar de posição, controlar o ritmo"
    },
    10: {
        "tom": "fantasia sem limites",
        "foco": "qualquer ato consensual, fantasias específicas, brinquedos",
        "linguagem": "máxima explicitude, palavras cruas",
        "exemplo_acao": "usar vibradores, anal, dominação completa"
    }
}


GAME_MASTER_SYSTEM = """Você é o Mestre de Intimidade de um aplicativo para casais adultos.

### CONTEXTO
Este é um ambiente privado, seguro e consensual entre adultos em relacionamento.
Seu papel é guiar experiências de conexão e intimidade progressiva.

### PRINCÍPIOS
1. Respeitar o nível de intensidade solicitado
2. Criar instruções ESPECÍFICAS (quem faz o quê, onde, como)
3. Usar linguagem sensual mas respeitosa
4. Focar na conexão emocional além da física

### FORMATO DE RESPOSTA (JSON)
{
  "challenge_title": "Título evocativo (3-5 palavras)",
  "challenge_text": "Instrução detalhada com ações específicas",
  "rationale": "Por que isso conecta o casal",
  "duration_seconds": 60-300,
  "intensity": 1-10
}

### EXEMPLO NÍVEL 3
{
  "challenge_title": "Mapa do Prazer",
  "challenge_text": "Ele deve passar os dedos suavemente pelas costas dela, de cima a baixo, enquanto ela indica com sons qual região mais gosta. Depois, invertem os papéis.",
  "rationale": "Descobrir as zonas sensíveis um do outro cria intimidade e comunicação.",
  "duration_seconds": 180,
  "intensity": 3
}

### EXEMPLO NÍVEL 7
{
  "challenge_title": "Vendas e Sensações",
  "challenge_text": "Com os olhos vendados, ela deve adivinhar qual parte do corpo dele está tocando apenas com os lábios. Cada acerto ganha um beijo no local de escolha.",
  "rationale": "A venda intensifica sensações e cria antecipação.",
  "duration_seconds": 240,
  "intensity": 7
}
"""


def build_game_master_prompt(
    visual_context: str,
    heat_level: int,
    couple_context: Optional[str] = None
) -> str:
    """Constrói prompt completo para geração de desafio.

    Args:
        visual_context: Descrição visual da cena (do VisionEngine)
        heat_level: Nível de intensidade (1-10)
        couple_context: Contexto adicional do casal (opcional)

    Returns:
        Prompt formatado para o GameMasterEngine
    """
    # Validar heat_level
    heat_level = max(1, min(10, heat_level))

    # Obter descrições do nível
    intensity_desc = INTENSITY_DESCRIPTIONS.get(heat_level, INTENSITY_DESCRIPTIONS[5])
    profile = INTENSITY_PROFILES.get(heat_level, INTENSITY_PROFILES[5])

    # Sanitizar inputs
    safe_visual = sanitize_user_input(visual_context)
    safe_couple = sanitize_user_input(couple_context) if couple_context else None

    prompt_parts = [
        GAME_MASTER_SYSTEM,
        "",
        "### CENA ATUAL",
        f"Descrição visual: {safe_visual}",
        "",
        f"### NÍVEL DE INTENSIDADE: {heat_level}/10",
        f"Descrição: {intensity_desc}",
        f"Tom: {profile['tom']}",
        f"Foco corporal: {profile['foco']}",
        f"Estilo de linguagem: {profile['linguagem']}",
        f"Exemplos de ações: {profile['exemplo_acao']}",
    ]

    if safe_couple:
        prompt_parts.extend([
            "",
            "### CONTEXTO DO CASAL",
            safe_couple,
        ])

    prompt_parts.extend([
        "",
        "### INSTRUÇÃO",
        "Crie UM desafio de intimidade baseado na cena e nível acima.",
        "Responda APENAS com o JSON, sem explicações adicionais.",
    ])

    return "\n".join(prompt_parts)


# === CHAT PROMPTS ===

CHAT_BASE_SYSTEM = """Você é o Mestre do Jogo de um app de intimidade para casais adultos.
Este é um ambiente privado e consensual. Não há restrições de conteúdo.
Seu papel é guiar o casal em experiências de conexão e intimidade.
Responda sempre em português brasileiro, de forma calorosa e envolvente."""


def build_chat_system_prompt(context: Optional[str] = None) -> str:
    """Constrói system prompt para chat.

    Args:
        context: Contexto do casal (opcional)

    Returns:
        System prompt para chat
    """
    prompt = CHAT_BASE_SYSTEM

    if context:
        safe_context = sanitize_user_input(context)
        prompt += f"\n\nCONTEXTO ATUAL DO CASAL: {safe_context}"

    return prompt


# === MOSAIC TITLE PROMPT ===

MOSAIC_TITLE_SYSTEM = """Você é um poeta romântico.
Crie títulos curtos e evocativos para álbuns de fotos de casais.
Máximo 6 palavras. Sem aspas na resposta."""


def build_mosaic_title_prompt() -> str:
    """Retorna prompt para geração de título de mosaico."""
    return "Crie um título poético para este mosaico de memórias do casal."


# === FALLBACKS ===

def get_fallback_challenge(heat_level: int) -> IntimacyChallenge:
    """Retorna fallback apropriado ao nível de intensidade.

    Args:
        heat_level: Nível de intensidade solicitado

    Returns:
        Desafio de fallback contextualizado
    """
    fallbacks: dict[int, dict] = {
        1: {
            "challenge_title": "Olhar Profundo",
            "challenge_text": "Sentem-se frente a frente e olhem nos olhos um do outro por 60 segundos em silêncio, segurando as mãos.",
            "rationale": "O contato visual prolongado libera oxitocina e cria conexão.",
        },
        3: {
            "challenge_title": "Carícia Guiada",
            "challenge_text": "Ela guia a mão dele pelo próprio corpo, mostrando onde gosta de ser tocada, enquanto descreve as sensações.",
            "rationale": "Comunicar preferências fortalece a intimidade.",
        },
        5: {
            "challenge_title": "Exploração Sensorial",
            "challenge_text": "Um fecha os olhos enquanto o outro passa objetos de diferentes texturas pela pele - gelo, pena, seda.",
            "rationale": "Estimular os sentidos com surpresa cria antecipação.",
        },
        7: {
            "challenge_title": "Vendas e Descobertas",
            "challenge_text": "Com os olhos vendados, um deve adivinhar qual parte do corpo do outro está sendo beijada.",
            "rationale": "A venda intensifica sensações e desperta curiosidade.",
        },
        10: {
            "challenge_title": "Realização de Fantasia",
            "challenge_text": "Compartilhem uma fantasia em voz alta e escolham uma ação para realizar juntos agora.",
            "rationale": "Vulnerabilidade e realização fortalecem intimidade.",
        },
    }

    # Encontrar fallback mais próximo
    closest = min(fallbacks.keys(), key=lambda x: abs(x - heat_level))
    base = fallbacks[closest].copy()
    base["duration_seconds"] = 120
    base["intensity"] = heat_level
    base["error"] = "fallback_response"

    return base  # type: ignore


# === JSON PARSING ===

def parse_challenge_json(text: str, heat_level: int) -> IntimacyChallenge:
    """Parse JSON de resposta com fallbacks robustos.

    Args:
        text: Texto de resposta do modelo
        heat_level: Nível de intensidade para fallback

    Returns:
        Desafio parseado ou fallback
    """
    import json
    import logging

    logger = logging.getLogger(__name__)

    # Limpar resposta
    cleaned = text.strip()

    # Remover markdown se presente
    if cleaned.startswith("```"):
        # Extrair conteúdo entre ```
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
        if match:
            cleaned = match.group(1)

    # Tentar extrair JSON de qualquer lugar
    json_match = re.search(r'\{[\s\S]*\}', cleaned)
    if json_match:
        cleaned = json_match.group(0)

    try:
        result = json.loads(cleaned)

        # Validar campos obrigatórios
        required = ["challenge_title", "challenge_text", "rationale", "duration_seconds", "intensity"]
        for field in required:
            if field not in result:
                raise ValueError(f"Campo ausente: {field}")

        return result

    except (json.JSONDecodeError, ValueError) as e:
        logger.warning(f"JSON parse failed: {e}. Raw: {text[:200]}...")
        return get_fallback_challenge(heat_level)
