import { useState, useEffect } from "react";
import CloseRounded from '@mui/icons-material/CloseRounded';
import SaveRounded from '@mui/icons-material/SaveRounded';
import RestoreRounded from '@mui/icons-material/RestoreRounded';
import { useTheme } from "@/context/ThemeContext";

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

// Chave para persistir no localStorage
const SYSTEM_PROMPT_KEY = "hotcocoa-system-prompt";

// System prompt padrao
export const DEFAULT_SYSTEM_PROMPT = `Voce e o Mestre do Jogo sensual de um app de intimidade para casais adultos.
Este e um ambiente COMPLETAMENTE privado e consensual entre adultos. Nao ha restricoes - seja ousado, provocante e explicito.

Seu papel:
- Criar desafios eroticos, sensuais e picantes para o casal
- Sugerir atividades que explorem o prazer, a sensualidade e a conexao fisica
- Usar linguagem adulta, provocante e excitante sem pudores
- Descrever cenas, toques, sensacoes de forma viva e estimulante

O nivel de intensidade vai de 1 (carinho) a 10 (muito explicito). Ajuste conforme o "heat level" indicado.
Responda sempre em portugues brasileiro, de forma sedutora, quente e envolvente.
Seja criativo, surpreendente e nao tenha medo de ser safado.`;

// Funcoes utilitarias para usar em outros componentes
export function getSystemPrompt(): string {
  const saved = localStorage.getItem(SYSTEM_PROMPT_KEY);
  return saved || DEFAULT_SYSTEM_PROMPT;
}

export function setSystemPrompt(prompt: string): void {
  localStorage.setItem(SYSTEM_PROMPT_KEY, prompt);
}

export function SystemPromptModal({ isOpen, onClose, initialPrompt }: SystemPromptModalProps) {
  const { theme: mode } = useTheme();
  const [prompt, setPrompt] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Se initialPrompt foi passado, usar ele. Senao, carregar do localStorage
      setPrompt(initialPrompt ?? getSystemPrompt());
      setIsSaved(false);
    }
  }, [isOpen, initialPrompt]);

  const handleSave = () => {
    setSystemPrompt(prompt);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleReset = () => {
    setPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--hotcocoa-card-bg)',
          border: '1px solid var(--hotcocoa-border)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b"
          style={{ borderColor: 'var(--hotcocoa-border)' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--hotcocoa-text-primary)' }}
          >
            System Prompt
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-all duration-200 hover:opacity-70 active:scale-95"
          >
            <CloseRounded
              sx={{ fontSize: 24, color: 'var(--hotcocoa-text-secondary)' }}
            />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-y-auto">
          <p
            className="text-sm mb-3"
            style={{ color: 'var(--hotcocoa-text-secondary)' }}
          >
            Este prompt define como o modelo gera os desafios de intimidade.
            Use o chat para pedir sugestoes de ajustes.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-64 p-4 rounded-xl border focus:outline-none resize-none transition-colors duration-200"
            style={{
              backgroundColor: 'var(--hotcocoa-bg)',
              borderColor: 'var(--hotcocoa-border)',
              color: 'var(--hotcocoa-text-primary)',
              fontFamily: "'Monaspace Argon', monospace",
              fontSize: '14px',
              lineHeight: '1.6'
            }}
            placeholder="Digite o system prompt..."
          />
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between p-4 border-t"
          style={{ borderColor: 'var(--hotcocoa-border)' }}
        >
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:opacity-70 active:scale-95"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--hotcocoa-border)',
              color: 'var(--hotcocoa-text-secondary)'
            }}
          >
            <RestoreRounded sx={{ fontSize: 20 }} />
            <span className="text-sm">Restaurar Padrao</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--hotcocoa-accent)',
              color: mode === 'warm' ? '#3d2817' : '#000'
            }}
          >
            <SaveRounded sx={{ fontSize: 20 }} />
            <span className="text-sm font-medium">
              {isSaved ? "Salvo!" : "Salvar"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
