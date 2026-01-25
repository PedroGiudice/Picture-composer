import { useState } from "react";
import ArrowBackRounded from '@mui/icons-material/ArrowBackRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import RefreshRounded from '@mui/icons-material/RefreshRounded';
import CheckRounded from '@mui/icons-material/CheckRounded';
import { useTheme } from "@/context/ThemeContext";
import { GameMasterChat } from "@/services/gameMasterChat";
import { setSystemPrompt } from "@/components/SystemPromptModal";
import { STORAGE_KEYS, CUSTOM_PRESET_ID } from "@/constants/promptPresets";

interface PromptCreatorChatProps {
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

// Meta-prompt para geracao (sincronizado com backend)
const META_PROMPT = `Voce e um especialista em criar system prompts personalizados para um app de intimidade entre casais adultos.

### SUA TAREFA
Baseado na descricao do usuario, crie um system prompt unico e personalizado.

### ESTRUTURA DO PROMPT
1. Definir a persona (quem o assistente sera)
2. Tom de comunicacao (poetico, provocante, brincalhao, etc.)
3. Foco principal (emocional, fisico, fantasias, jogos)
4. Nivel de explicitude
5. Instrucoes de idioma (portugues brasileiro)

### REGRAS
- O prompt deve ter 100-300 palavras
- Responda APENAS com o system prompt criado
- Nao inclua explicacoes, so o prompt final
- Use linguagem direta e clara
- O prompt sera usado diretamente pelo modelo

### DESCRICAO DO USUARIO:
`;

export function PromptCreatorChat({
  isOpen,
  onClose,
  onBack
}: PromptCreatorChatProps) {
  const { theme: mode } = useTheme();
  const [description, setDescription] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!description.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      // Usar META_PROMPT como system prompt e enviar descricao do usuario
      const response = await GameMasterChat.sendSimple(
        description,
        META_PROMPT
      );

      setGeneratedPrompt(response);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao gerar prompt";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setGeneratedPrompt(null);
  };

  const handleUsePrompt = () => {
    if (!generatedPrompt) return;

    // Salvar como preset customizado
    localStorage.setItem(STORAGE_KEYS.SELECTED_PRESET, CUSTOM_PRESET_ID);
    setSystemPrompt(generatedPrompt);

    onClose();
  };

  const handleBack = () => {
    // Reset state
    setDescription("");
    setGeneratedPrompt(null);
    setError(null);
    onBack();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-xl rounded-2xl p-6 shadow-2xl max-h-[85vh] overflow-hidden flex flex-col transition-colors duration-300"
        style={{
          backgroundColor: 'var(--hotcocoa-card-bg)',
          borderRadius: '16px'
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95"
              aria-label="Voltar"
              style={{
                minWidth: '44px',
                minHeight: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ArrowBackRounded
                sx={{
                  fontSize: 24,
                  color: 'var(--hotcocoa-text-secondary)'
                }}
              />
            </button>
            <h2
              className="text-xl transition-colors duration-300"
              style={{ color: 'var(--hotcocoa-text-primary)' }}
            >
              Criar Meu Estilo
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!generatedPrompt ? (
            /* Input Phase */
            <div className="space-y-4">
              <p
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-secondary)' }}
              >
                Descreva o tipo de experiencia que voce quer com o app:
              </p>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Quero algo romantico mas picante, com foco em conexao emocional e surpresas sensuais..."
                className="w-full h-40 p-4 rounded-xl border focus:outline-none resize-none transition-colors duration-200"
                style={{
                  backgroundColor: 'var(--hotcocoa-bg)',
                  borderColor: 'var(--hotcocoa-border)',
                  color: 'var(--hotcocoa-text-primary)',
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}
                disabled={isLoading}
              />

              {error && (
                <p
                  className="text-sm"
                  style={{ color: '#ef4444' }}
                >
                  {error}
                </p>
              )}

              <button
                onClick={handleGenerate}
                disabled={!description.trim() || isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
                style={{
                  backgroundColor: 'var(--hotcocoa-accent)',
                  color: mode === 'warm' ? '#3d2817' : '#000',
                  borderRadius: '12px',
                  minHeight: '48px'
                }}
              >
                {isLoading ? (
                  <>
                    <div
                      className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                      style={{ borderColor: mode === 'warm' ? '#3d2817' : '#000' }}
                    />
                    <span className="text-sm font-medium">Criando...</span>
                  </>
                ) : (
                  <>
                    <AutoAwesomeRounded sx={{ fontSize: 20 }} />
                    <span className="text-sm font-medium">Criar Meu Prompt</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Preview Phase */
            <div className="space-y-4">
              <p
                className="text-sm transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-secondary)' }}
              >
                Seu prompt personalizado:
              </p>

              <div
                className="p-4 rounded-xl border transition-colors duration-200 max-h-60 overflow-y-auto"
                style={{
                  backgroundColor: 'var(--hotcocoa-bg)',
                  borderColor: 'var(--hotcocoa-border)'
                }}
              >
                <p
                  className="text-sm whitespace-pre-wrap"
                  style={{
                    color: 'var(--hotcocoa-text-primary)',
                    lineHeight: '1.6'
                  }}
                >
                  {generatedPrompt}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Try Again */}
                <button
                  onClick={handleTryAgain}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 hover:opacity-80 active:scale-95"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--hotcocoa-border)',
                    color: 'var(--hotcocoa-text-secondary)',
                    borderRadius: '12px',
                    minHeight: '48px'
                  }}
                >
                  <RefreshRounded sx={{ fontSize: 20 }} />
                  <span className="text-sm">Tentar Novamente</span>
                </button>

                {/* Use This */}
                <button
                  onClick={handleUsePrompt}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: 'var(--hotcocoa-accent)',
                    color: mode === 'warm' ? '#3d2817' : '#000',
                    borderRadius: '12px',
                    minHeight: '48px'
                  }}
                >
                  <CheckRounded sx={{ fontSize: 20 }} />
                  <span className="text-sm font-medium">Usar Este</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
