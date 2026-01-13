import React, { useState, useEffect, useMemo } from 'react';
import { RefreshCw, ArrowRight, Heart } from 'lucide-react';
import { Button } from './Button';
import { Question } from '../types';

interface MemoryViewerProps {
  files: File[];
  questions: Question[];
  onReset: () => void;
}

export const MemoryViewer: React.FC<MemoryViewerProps> = ({ files, questions, onReset }) => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const generateMemory = () => {
    setIsRevealed(false);
    setTimeout(() => {
      const randomFileIndex = Math.floor(Math.random() * files.length);
      const randomQuestionIndex = Math.floor(Math.random() * questions.length);
      setCurrentFile(files[randomFileIndex]);
      setCurrentQuestion(questions[randomQuestionIndex]);
      setIsRevealed(true);
    }, 300);
  };

  useEffect(() => {
    generateMemory();
  }, []);

  useEffect(() => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile);
      setPhotoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [currentFile]);

  if (!currentFile || !currentQuestion) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto min-h-[80vh] justify-center py-8 animate-fade-in">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        <div className="relative w-full aspect-[4/5] bg-slate-800 overflow-hidden shadow-2xl group">
           {photoUrl && (
             <img 
              src={photoUrl} 
              alt="Memory" 
              className={`w-full h-full object-cover transition-all duration-1000 ${isRevealed ? 'opacity-100 scale-100 grayscale-0' : 'opacity-0 scale-105 grayscale'}`}
            />
           )}
          <div className="absolute inset-0 border border-white/10 pointer-events-none" />
        </div>
        <div className="flex flex-col justify-center space-y-8 lg:space-y-12 h-full py-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-rose-500 font-medium tracking-widest text-xs uppercase">
              <Heart className="w-4 h-4 fill-current" />
              <span>Reflexão do Casal</span>
            </div>
            <h1 className={`text-3xl md:text-5xl font-bold leading-tight transition-all duration-700 delay-300 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
              {currentQuestion.text}
            </h1>
          </div>
          <div className={`w-12 h-0.5 bg-rose-500 transition-all duration-700 delay-500 ${isRevealed ? 'w-12 opacity-100' : 'w-0 opacity-0'}`} />
          <div className={`space-y-4 transition-all duration-700 delay-700 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <p className="text-slate-400 text-lg leading-relaxed">
              Olhe para a foto. Respire fundo. Compartilhe sua resposta com sinceridade. Não há pressa.
            </p>
            <div className="flex flex-wrap gap-4 pt-8">
              <Button onClick={generateMemory} icon={<ArrowRight className="w-4 h-4" />}>
                Próxima Memória
              </Button>
              <Button variant="outline" onClick={onReset} icon={<RefreshCw className="w-4 h-4" />}>
                Trocar Fotos
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};