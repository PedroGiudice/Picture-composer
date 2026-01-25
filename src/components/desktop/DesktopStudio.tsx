import React, { useState } from 'react';
import { Camera, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeatSlider } from '@/components/HeatSlider';

export function DesktopStudio() {
  const [intensity, setIntensity] = useState(3);
  const [context, setContext] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedImage(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleStartSession = () => {
    // TODO: Integrar com chat
    console.log('Start session with:', { intensity, context, selectedImage });
  };

  return (
    <div className="h-full flex">
      {/* Area de Foto - 60% */}
      <div className="w-3/5 h-full p-6 flex flex-col">
        <label className="flex-1 relative group cursor-pointer rounded-xl border border-white/10 bg-card/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-primary/50">
          {selectedImage ? (
            <img src={selectedImage} alt="Upload" className="w-full h-full object-contain" />
          ) : (
            <div className="flex flex-col items-center gap-4 text-muted-foreground group-hover:text-primary transition-colors">
              <div className="p-6 rounded-full bg-white/5 group-hover:bg-primary/10">
                <Camera size={48} />
              </div>
              <div className="text-center space-y-2">
                <p className="text-sm font-bold tracking-widest uppercase">Adicione uma foto</p>
                <p className="text-xs opacity-60">Para o Game Master</p>
              </div>
            </div>
          )}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {/* Controles - 40% */}
      <div className="w-2/5 h-full p-6 bg-card/30 border-l border-border/30 flex flex-col gap-6">
        <h2 className="text-lg font-bold tracking-widest uppercase text-primary">Configurar Sessao</h2>

        <HeatSlider value={intensity} onChange={setIntensity} />

        <div className="relative">
          <input
            type="text"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Contexto: Jantar, Sofa..."
            className="w-full bg-card border border-white/10 rounded-xl p-4 text-sm focus:border-primary focus:outline-none transition-colors placeholder:text-muted-foreground/50"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Sparkles size={16} />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStartSession}
          className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold tracking-widest uppercase text-sm shadow-[0_0_20px_rgba(255,107,107,0.3)] hover:shadow-[0_0_30px_rgba(255,107,107,0.5)] transition-shadow mt-auto"
        >
          Iniciar Sessao
        </motion.button>
      </div>
    </div>
  );
}
