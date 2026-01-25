import { useState, useEffect } from "react";
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
  STORAGE_KEYS,
  type PromptPreset
} from "@/constants/promptPresets";
import { setSystemPrompt } from "@/components/SystemPromptModal";
import { Modal } from "@/components/Modal";
import { cn } from "@/lib/utils";

interface PromptSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreator: () => void;
  onOpenAdvanced: (initialPrompt?: string) => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  LocalFireDepartmentRounded,
  FavoriteRounded,
  SentimentVerySatisfiedRounded,
  GavelRounded,
  PsychologyRounded,
  TheaterComedyRounded,
};

function getSavedPreset(): string {
  return localStorage.getItem(STORAGE_KEYS.SELECTED_PRESET) || PROMPT_PRESETS[0].id;
}

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

  useEffect(() => {
    if (isOpen) {
      setSelectedId(getSavedPreset());
    }
  }, [isOpen]);

  const handleSelect = (preset: PromptPreset) => {
    setSelectedId(preset.id);
  };

  const handleUseSelected = () => {
    savePreset(selectedId);
    const preset = PROMPT_PRESETS.find(p => p.id === selectedId);
    if (preset) {
      setSystemPrompt(preset.content);
    }
    onClose();
  };

  const handleOpenAdvanced = () => {
    const preset = PROMPT_PRESETS.find(p => p.id === selectedId);
    onClose();
    onOpenAdvanced(preset?.content);
  };

  const handleOpenCreator = () => {
    onClose();
    onOpenCreator();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Escolha sua Persona">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto p-1">
          {PROMPT_PRESETS.map((preset) => {
            const IconComponent = ICON_MAP[preset.icon] || LocalFireDepartmentRounded;
            const isSelected = selectedId === preset.id;

            return (
              <button
                key={preset.id}
                onClick={() => handleSelect(preset)}
                className={cn(
                  "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 active:scale-95 text-left group overflow-hidden",
                  isSelected 
                    ? "border-primary bg-primary/10 shadow-lg scale-[1.02]" 
                    : "border-border/50 hover:border-border hover:bg-white/5 opacity-80 hover:opacity-100"
                )}
                style={{
                  borderColor: isSelected ? 'var(--hotcocoa-accent)' : undefined
                }}
              >
                 {isSelected && (
                   <div 
                     className="absolute top-0 right-0 p-2"
                     style={{ color: 'var(--hotcocoa-accent)' }}
                   >
                     <CheckCircleRounded fontSize="small" />
                   </div>
                 )}
                
                <div
                  className="p-3 rounded-full mb-3 transition-colors duration-300"
                  style={{
                    backgroundColor: isSelected ? 'var(--hotcocoa-accent)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? (mode === 'warm' ? '#3d2817' : '#000') : 'var(--hotcocoa-accent)'
                  }}
                >
                  <IconComponent sx={{ fontSize: 28 }} />
                </div>

                <div className="font-bold text-lg mb-1" style={{ color: 'var(--hotcocoa-text-primary)' }}>
                  {preset.name}
                </div>
                <div className="text-sm opacity-70 leading-snug" style={{ color: 'var(--hotcocoa-text-secondary)' }}>
                  {preset.description}
                </div>
              </button>
            );
          })}
        </div>
        
        <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
            <button
                onClick={handleOpenCreator}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed transition-all hover:bg-white/5 active:scale-95 group"
                style={{ borderColor: 'var(--hotcocoa-accent)' }}
            >
                <AutoAwesomeRounded sx={{ color: 'var(--hotcocoa-accent)' }} />
                <span style={{ color: 'var(--hotcocoa-accent)' }} className="font-medium group-hover:underline">Criar Nova Persona</span>
            </button>

            <div className="flex gap-3 mt-2">
                <button
                    onClick={handleOpenAdvanced}
                    className="flex-1 py-3 rounded-xl text-sm font-medium border transition-all hover:bg-white/5 active:scale-95"
                    style={{ borderColor: 'var(--hotcocoa-border)', color: 'var(--hotcocoa-text-secondary)' }}
                >
                    <div className="flex items-center justify-center gap-2">
                        <EditRounded fontSize="small" />
                        <span>Editar Prompt</span>
                    </div>
                </button>
                <button
                    onClick={handleUseSelected}
                    className="flex-[2] py-3 rounded-xl text-sm font-bold shadow-lg transition-all hover:brightness-110 active:scale-95"
                    style={{ 
                        backgroundColor: 'var(--hotcocoa-accent)',
                        color: mode === 'warm' ? '#3d2817' : '#000'
                    }}
                >
                    Aplicar Persona
                </button>
            </div>
        </div>
      </div>
    </Modal>
  );
}
