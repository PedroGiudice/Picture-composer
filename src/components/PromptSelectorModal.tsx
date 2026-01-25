import { useState, useEffect } from "react";
import CloseRounded from '@mui/icons-material/CloseRounded';
import CheckCircleRounded from '@mui/icons-material/CheckCircleRounded';
import AutoAwesomeRounded from '@mui/icons-material/AutoAwesomeRounded';
import EditRounded from '@mui/icons-material/EditRounded';
import LocalFireDepartmentRounded from '@mui/icons-material/LocalFireDepartmentRounded';
import FavoriteRounded from '@mui/icons-material/FavoriteRounded';
import SentimentVerySatisfiedRounded from '@mui/icons-material/SentimentVerySatisfiedRounded';
import GavelRounded from '@mui/icons-material/GavelRounded';
import PsychologyRounded from '@mui/icons-material/PsychologyRounded';
import TheaterComedyRounded from '@mui/icons-material/TheaterComedyRounded';
import { useTheme } from "@/context/ThemeContext";
import {
  PROMPT_PRESETS,
  CUSTOM_PRESET_ID,
  STORAGE_KEYS,
  type PromptPreset
} from "@/constants/promptPresets";
import { setSystemPrompt } from "@/components/SystemPromptModal";

interface PromptSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreator: () => void;
  onOpenAdvanced: (initialPrompt?: string) => void;
}

// Mapa de icones por nome
const ICON_MAP: Record<string, React.ElementType> = {
  LocalFireDepartmentRounded,
  FavoriteRounded,
  SentimentVerySatisfiedRounded,
  GavelRounded,
  PsychologyRounded,
  TheaterComedyRounded,
};

// Obter preset salvo
function getSavedPreset(): string {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_PRESET) || PROMPT_PRESETS[0].id;
}

// Salvar preset selecionado
function savePreset(presetId: string): void {
  localStorage.setItem(STORAGE_KEYS.SELECTED_PRESET, presetId);
}

export function PromptSelectorModal({
  isOpen,
  onClose,
  onOpenCreator,
  onOpenAdvanced
}: PromptSelectorModalProps) {
  const { mode } = useTheme();
  const [selectedId, setSelectedId] = useState<string>(getSavedPreset());

  // Sincronizar com localStorage ao abrir
  useEffect(() => {
    if (isOpen) {
      setSelectedId(getSavedPreset());
    }
  }, [isOpen]);

  const handleSelect = (preset: PromptPreset) => {
    setSelectedId(preset.id);
  };

  const handleUseSelected = () => {
    // Salvar preset selecionado
    savePreset(selectedId);

    // Encontrar preset e salvar o system prompt
    const preset = PROMPT_PRESETS.find(p => p.id === selectedId);
    if (preset) {
      setSystemPrompt(preset.content);
    }

    onClose();
  };

  const handleOpenAdvanced = () => {
    // Encontrar preset selecionado para pre-popular
    const preset = PROMPT_PRESETS.find(p => p.id === selectedId);
    onClose();
    onOpenAdvanced(preset?.content);
  };

  const handleOpenCreator = () => {
    onClose();
    onOpenCreator();
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
            <div
              className="p-2 rounded-xl transition-colors duration-300"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <AutoAwesomeRounded
                sx={{
                  fontSize: 24,
                  color: 'var(--hotcocoa-accent)'
                }}
              />
            </div>
            <h2
              className="text-xl transition-colors duration-300"
              style={{ color: 'var(--hotcocoa-text-primary)' }}
            >
              Escolha seu Estilo
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-200 active:scale-95"
            aria-label="Fechar"
            style={{
              minWidth: '48px',
              minHeight: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CloseRounded
              sx={{
                fontSize: 24,
                color: 'var(--hotcocoa-text-secondary)'
              }}
            />
          </button>
        </div>

        {/* Preset List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-6">
          {PROMPT_PRESETS.map((preset) => {
            const IconComponent = ICON_MAP[preset.icon] || LocalFireDepartmentRounded;
            const isSelected = selectedId === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => handleSelect(preset)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 active:scale-[0.98] ${
                  isSelected ? "scale-[1.02]" : "opacity-70 hover:opacity-100"
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--hotcocoa-bg)' : 'transparent',
                  borderColor: isSelected ? 'var(--hotcocoa-accent)' : 'var(--hotcocoa-border)',
                  borderRadius: '12px'
                }}
              >
                {/* Icon */}
                <div
                  className="p-2 rounded-lg transition-colors duration-300"
                  style={{
                    backgroundColor: isSelected ? 'var(--hotcocoa-accent)' : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <IconComponent
                    sx={{
                      fontSize: 28,
                      color: isSelected
                        ? (mode === 'warm' ? '#3d2817' : '#000')
                        : 'var(--hotcocoa-accent)'
                    }}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 text-left">
                  <div
                    className="text-base font-medium transition-colors duration-300"
                    style={{ color: 'var(--hotcocoa-text-primary)' }}
                  >
                    {preset.name}
                  </div>
                  <div
                    className="text-sm opacity-80 transition-colors duration-300"
                    style={{ color: 'var(--hotcocoa-text-secondary)' }}
                  >
                    {preset.description}
                  </div>
                </div>

                {/* Check mark */}
                {isSelected && (
                  <CheckCircleRounded
                    sx={{
                      fontSize: 24,
                      color: 'var(--hotcocoa-accent)'
                    }}
                  />
                )}
              </button>
            );
          })}

          {/* Create Custom Option */}
          <button
            onClick={handleOpenCreator}
            className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed transition-all duration-300 opacity-70 hover:opacity-100 active:scale-[0.98]"
            style={{
              borderColor: 'var(--hotcocoa-border)',
              borderRadius: '12px'
            }}
          >
            {/* Icon */}
            <div
              className="p-2 rounded-lg transition-colors duration-300"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <AutoAwesomeRounded
                sx={{
                  fontSize: 28,
                  color: 'var(--hotcocoa-accent)'
                }}
              />
            </div>

            {/* Text */}
            <div className="flex-1 text-left">
              <div
                className="text-base font-medium transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-primary)' }}
              >
                Criar Meu Proprio
              </div>
              <div
                className="text-sm opacity-80 transition-colors duration-300"
                style={{ color: 'var(--hotcocoa-text-secondary)' }}
              >
                Descreva e a IA cria pra voce
              </div>
            </div>
          </button>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center gap-3">
          {/* Edit Advanced */}
          <button
            onClick={handleOpenAdvanced}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-300 hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--hotcocoa-border)',
              color: 'var(--hotcocoa-text-secondary)',
              borderRadius: '12px',
              minHeight: '48px'
            }}
          >
            <EditRounded sx={{ fontSize: 20 }} />
            <span className="text-sm">Editar Avancado</span>
          </button>

          {/* Use Selected */}
          <button
            onClick={handleUseSelected}
            className="flex-1 py-3 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--hotcocoa-accent)',
              color: mode === 'warm' ? '#3d2817' : '#000',
              borderRadius: '12px',
              minHeight: '48px'
            }}
          >
            <span className="text-sm font-medium">Usar Selecionado</span>
          </button>
        </div>
      </div>
    </div>
  );
}
