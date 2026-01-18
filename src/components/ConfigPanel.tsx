// src/components/ConfigPanel.tsx
import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as Switch from '@radix-ui/react-switch';
import * as Slider from '@radix-ui/react-slider';
import { X, Settings, Flame, Heart, Cpu } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const ConfigPanel: React.FC = () => {
  const { mode, setMode, settings, updateAiSettings } = useTheme();

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 border border-slate-700 w-[90vw] max-w-md rounded-xl p-6 shadow-2xl z-50 animate-scale-in">
          
          <div className="flex justify-between items-center mb-6">
            <Dialog.Title className="text-lg font-bold text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-slate-400" />
              System Configuration
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-8">
            
            {/* MODE SWITCH */}
            <div className="space-y-3 pb-6 border-b border-slate-800">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Experience Mode</label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg transition-colors ${mode === 'HOT' ? 'bg-rose-500/20 text-rose-500' : 'bg-slate-800 text-slate-600'}`}>
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <p className={`font-bold transition-colors ${mode === 'HOT' ? 'text-rose-500' : 'text-slate-400'}`}>HOT</p>
                    <p className="text-[10px] text-slate-500">Visceral & Explicit</p>
                  </div>
                </div>

                <Switch.Root 
                  checked={mode === 'WARM'} 
                  onCheckedChange={(c) => setMode(c ? 'WARM' : 'HOT')}
                  className="w-14 h-8 bg-slate-800 rounded-full relative data-[state=checked]:bg-pink-900 border border-slate-700 data-[state=checked]:border-pink-700 transition-colors"
                >
                  <Switch.Thumb className="block w-6 h-6 bg-white rounded-full transition-transform duration-100 transform translate-x-1 data-[state=checked]:translate-x-7" />
                </Switch.Root>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className={`font-bold transition-colors ${mode === 'WARM' ? 'text-pink-500' : 'text-slate-400'}`}>WARM</p>
                    <p className="text-[10px] text-slate-500">Deep & Emotional</p>
                  </div>
                  <div className={`p-2 rounded-lg transition-colors ${mode === 'WARM' ? 'bg-pink-500/20 text-pink-500' : 'bg-slate-800 text-slate-600'}`}>
                    <Heart className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            {/* AI PARAMETERS */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Cpu className="w-4 h-4 text-slate-400" />
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Model Parameters</label>
              </div>

              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Temperature (Creativity)</span>
                  <span className="font-mono text-rose-400">{settings.aiSettings.temperature}</span>
                </div>
                <Slider.Root 
                  className="relative flex items-center select-none touch-none w-full h-5"
                  defaultValue={[0.8]}
                  max={1.5}
                  step={0.1}
                  value={[settings.aiSettings.temperature]}
                  onValueChange={([v]) => updateAiSettings({ temperature: v })}
                >
                  <Slider.Track className="bg-slate-800 relative grow rounded-full h-[3px]">
                    <Slider.Range className="absolute bg-slate-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] rounded-[10px] hover:bg-slate-100 focus:outline-none" />
                </Slider.Root>
              </div>

              {/* Max Tokens */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Max Tokens (Length)</span>
                  <span className="font-mono text-rose-400">{settings.aiSettings.maxTokens}</span>
                </div>
                <Slider.Root 
                  className="relative flex items-center select-none touch-none w-full h-5"
                  defaultValue={[1024]}
                  max={4096}
                  step={128}
                  value={[settings.aiSettings.maxTokens]}
                  onValueChange={([v]) => updateAiSettings({ maxTokens: v })}
                >
                  <Slider.Track className="bg-slate-800 relative grow rounded-full h-[3px]">
                    <Slider.Range className="absolute bg-slate-500 rounded-full h-full" />
                  </Slider.Track>
                  <Slider.Thumb className="block w-4 h-4 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] rounded-[10px] hover:bg-slate-100 focus:outline-none" />
                </Slider.Root>
              </div>

            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
