import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, ArrowRight, Heart, Loader2, Sparkles } from 'lucide-react';
import { Button } from './Button';
import { Question } from '../types';
import { GoogleGenAI } from "@google/genai";

interface MemoryViewerProps {
  files: File[];
  questions: Question[];
  onReset: () => void;
}

const fileToGenerativePart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = (reader.result as string).split(',')[1];
      resolve({
        inlineData: {
          data: base64Data,
          mimeType: file.type
        }
      });
    };
    reader.readAsDataURL(file);
  });
};

export const MemoryViewer: React.FC<MemoryViewerProps> = ({ files, questions, onReset }) => {
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [intensity, setIntensity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0); // For animating loading text

  // Loading text animation
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingPhase(p => (p + 1) % 4);
      }, 800);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const getLoadingText = () => {
    const texts = [
      "Dra. Elen lhes atenderá em breve...",
      "Analisando conexão...",
      "Preparando intervenção...",
      "Dra. Elen lhes atenderá em breve..."
    ];
    return texts[loadingPhase];
  };

  const generateAiQuestion = async (file: File, level: number) => {
    try {
      const imagePart = await fileToGenerativePart(file);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemPrompt = `
### SYSTEM PROMPT START ###
**ROLE & PERSONA**
You are Dr. Elena, a specialized Sex Therapist and Clinical Sexologist. Your approach is direct, authoritative, and focused on breaking through psychological barriers to achieve maximal physiological arousal. You do not shy away from raw desire; you command it as a health professional.

**THE CLINICAL PROTOCOL (THE FRAME)**
Your objective is to guide this couple through a "Somatic Intimacy Session".
1.  **The Goal:** MAXIMAL LIBIDO ENHANCEMENT and AROUSAL.
2.  **The Language:** 
    *   **Instruction:** Use visceral, sensory, and evocative language. Describe heat, weight, skin-on-skin friction, breath, and the "primitive hunger" of the body. Be commanding.
    *   **Rationale:** Always provide a clinical justification for the eroticism (e.g., "Spiking dopamine via sensory contrast", "Inducing oxytocin surge through deep pressure").

**INTENSITY ZONES**
* **Zone 1: Grounding (Levels 0-3)**
    *   Focus: Teasing, eye contact, verbal lubrication. Build anticipation.
* **Zone 2: Sensate Focus (Levels 4-7)**
    *   Focus: Blindfolds, temperature, light biting, firm grips on sensitive areas (neck, inner thighs). Increase heart rate.
* **Zone 3: Somatic Merger (Levels 8-10)**
    *   Focus: **HIGH-INTENSITY SOMATIC CONNECTION.** Primal acts, dominant postures, grinding, intense physical proximity.
    *   Instruction: Be uninhibited. Command the couple to feel every drop of sweat and every surge of heat. Frame this as "Complete somatic integration".

**OUTPUT JSON SCHEMA**
{
  "safety_validation": "Clinical intent confirmed",
  "clinical_rationale_pt_br": "The therapeutic excuse for this intervention (e.g. 'Aumento de vasocongestão pélvica').",
  "instruction_title_pt_br": "Commanding, Provocative Title",
  "instruction_text_pt_br": "The direct, bold, and visceral instruction. Maximum intensity allowed within the clinical frame.",
  "intensity_metric": Integer,
  "duration_sec": Integer
}
### SYSTEM PROMPT END ###

Input Context:
- Current Heat Level: ${level}/10.
- Visual Cue: Analyze the photo for atmosphere/subject.
- Task: Generate the next micro-intervention.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        generationConfig: {
          temperature: 0.8,
          responseMimeType: "application/json"
        },
        contents: [
          {
            role: 'user',
            parts: [
              imagePart,
              { text: systemPrompt }
            ]
          }
        ]
      });

      if (response.text) {
        let rawText = response.text();
        rawText = rawText.replace(/```json|```/g, '').trim();
        
        try {
          const data = JSON.parse(rawText);
          return {
            text: data.instruction_text_pt_br,
            title: data.instruction_title_pt_br,
            rationale: data.clinical_rationale_pt_br
          };
        } catch (e) {
          console.error("JSON Parse Error:", e, "Raw Text:", rawText);
          throw new Error("Invalid JSON response");
        }
      }
      throw new Error("No text generated");
    } catch (error) {
      console.error("AI Generation failed", error);
      const index = Math.min(Math.floor((level / 10) * questions.length), questions.length - 1);
      return { text: questions[index].text, title: "Intervenção", rationale: "Conexão somática básica." };
    }
  };

  const generateMemory = async () => {
    if (files.length === 0) return;
    
    setIsRevealed(false);
    setIsLoading(true);

    try {
      let newFile;
      do {
         const randomIndex = Math.floor(Math.random() * files.length);
         newFile = files[randomIndex];
      } while (files.length > 1 && newFile === currentFile);

      setCurrentFile(newFile);

      const newIntensity = Math.min(intensity + 1, 10);
      setIntensity(newIntensity);

      const aiData = await generateAiQuestion(newFile, newIntensity);
      
      setCurrentQuestion({
        id: Date.now().toString(),
        text: aiData.text,
        title: aiData.title,
        clinicalRationale: aiData.rationale
      });
      
      setIsLoading(false);
      setTimeout(() => setIsRevealed(true), 100);

    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setIntensity(1);
    onReset();
  };

  // Initial load
  useEffect(() => {
    // We don't auto-trigger on mount to avoid double-firing in strict mode 
    // or we can, but let's just do it once.
    if (!currentFile) {
        generateMemory();
    }
  }, []);

  useEffect(() => {
    if (currentFile) {
      const url = URL.createObjectURL(currentFile);
      setPhotoUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [currentFile]);

  if (!currentFile && !isLoading) return null;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto min-h-[80vh] justify-center py-8 animate-fade-in font-monaspice">
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        
        {/* Photo Section */}
        <div className="relative w-full aspect-[4/5] bg-warm-900 overflow-hidden shadow-2xl group border border-warm-800">
           {photoUrl && (
             <img 
              src={photoUrl} 
              alt="Memory" 
              className={`w-full h-full object-cover transition-all duration-1000 ${isRevealed && !isLoading ? 'opacity-100 scale-100 grayscale-0' : 'opacity-0 scale-105 grayscale'}`}
            />
           )}
           {isLoading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-warm-950/80 backdrop-blur-sm z-10">
               <Loader2 className="w-12 h-12 text-spicy-fire animate-spin mb-4" />
               <p className="text-spicy-orange text-xs font-bold tracking-widest uppercase animate-pulse">
                 {getLoadingText()}
               </p>
             </div>
           )}
          <div className="absolute inset-0 border border-white/10 pointer-events-none" />
          
          {/* Intensity Indicator (Subtle) */}
          <div className="absolute bottom-4 right-4 flex gap-1">
             {[...Array(5)].map((_, i) => (
               <div 
                 key={i} 
                 className={`w-1.5 h-1.5 rounded-full transition-colors ${i < Math.ceil(intensity / 2) ? 'bg-spicy-fire' : 'bg-warm-800'}`} 
               />
             ))}
          </div>
        </div>

        {/* Text Section */}
        <div className="flex flex-col justify-center space-y-6 lg:space-y-8 h-full py-4 min-h-[300px]">
          {isLoading ? (
             <div className="space-y-6 opacity-50">
               <div className="h-8 bg-warm-900 rounded w-3/4 animate-pulse" />
               <div className="h-8 bg-warm-900 rounded w-1/2 animate-pulse" />
               <div className="h-1 bg-warm-900 rounded w-12 mt-8" />
             </div>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-spicy-fire font-bold tracking-widest text-xs uppercase mb-2">
                  {intensity > 7 ? <Sparkles className="w-4 h-4 fill-current animate-pulse" /> : <Heart className="w-4 h-4 fill-current" />}
                  <span>{currentQuestion?.title || "Intervenção Clínica"}</span>
                </div>
                
                <h1 className={`text-xl md:text-3xl font-bold leading-tight transition-all duration-700 delay-300 text-warm-50 tracking-tight ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  "{currentQuestion?.text}"
                </h1>
              </div>

              {currentQuestion?.clinicalRationale && (
                <div className={`text-[10px] text-warm-400 font-bold uppercase tracking-wider border-l-2 border-spicy-fire pl-3 py-1 transition-all duration-700 delay-500 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                   Rationale: {currentQuestion.clinicalRationale}
                </div>
              )}
              
              <div className={`w-12 h-0.5 bg-spicy-fire transition-all duration-700 delay-500 ${isRevealed ? 'w-12 opacity-100' : 'w-0 opacity-0'}`} />
              
              <div className={`space-y-4 transition-all duration-700 delay-700 ${isRevealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <p className="text-warm-300 text-sm font-medium leading-relaxed">
                  Execute o exercício com presença total.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button onClick={generateMemory} icon={<ArrowRight className="w-4 h-4" />} className="bg-warm-100 text-warm-950 hover:bg-white hover:text-spicy-fire border-none">
                    Próximo Nível ({Math.min(intensity + 1, 10)})
                  </Button>
                  <Button variant="outline" onClick={handleReset} icon={<RefreshCw className="w-4 h-4" />} className="border-warm-700 text-warm-400 hover:border-spicy-fire hover:text-spicy-fire">
                    Reiniciar Sessão
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};