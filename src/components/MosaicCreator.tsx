import React, { useState, useRef, useEffect } from 'react';
import { Upload, Wand2, Download, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { generateMosaic } from '../utils/mosaic';
import { SomaticBackend } from '../services/api';

interface MosaicCreatorProps {
  sourceFiles: File[];
}

export const MosaicCreator: React.FC<MosaicCreatorProps> = ({ sourceFiles }) => {
  const [targetFile, setTargetFile] = useState<File | null>(null);
  const [targetUrl, setTargetUrl] = useState<string>('');
  const [mosaicUrl, setMosaicUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [aiTitle, setAiTitle] = useState<string>("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (targetFile) {
      const url = URL.createObjectURL(targetFile);
      setTargetUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [targetFile]);

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTargetFile(e.target.files[0]);
      setMosaicUrl(null);
      setError(null);
      setAiTitle("");
    }
  };

  const handleGenerate = async () => {
    if (!targetFile || sourceFiles.length === 0) return;
    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setMosaicUrl(null);

    try {
      const resultUrl = await generateMosaic(targetFile, sourceFiles, (p) => setProgress(p));
      setMosaicUrl(resultUrl);
    } catch (err: any) {
      console.error("Mosaic generation failed", err);
      setError(err.message || "An unexpected error occurred while generating the mosaic. Please check your connection and files.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAiTitle = async () => {
    if (!mosaicUrl) return;
    setIsAiThinking(true);
    try {
      // Connect to our Uncensored A100 Backend (Qwen2.5-VL)
      const title = await SomaticBackend.analyzeMosaic(mosaicUrl);
      setAiTitle(title);
    } catch (error) {
      console.error("AI Generation failed", error);
      setAiTitle("Mosaic of Our Memories");
    } finally {
      setIsAiThinking(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
          Mosaic Art <span className="text-rose-500">Creator</span>
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto">
          Recreate a special photo using hundreds of your smaller memories.
          <br/>
          <span className="text-xs text-slate-500">
            {sourceFiles.length} source memories available.
          </span>
        </p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-800/50 p-6 border border-slate-700 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">1. Select Target Photo</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed transition-colors p-8 cursor-pointer bg-slate-900/50 flex flex-col items-center justify-center text-center ${
                  targetFile ? 'border-rose-500/50' : 'border-slate-600 hover:border-rose-500/50'
                }`}
              >
                {targetFile ? (
                  <div className="space-y-2">
                    {targetUrl && (
                      <img 
                        src={targetUrl} 
                        alt="Target" 
                        className="w-32 h-32 object-cover mx-auto shadow-md border border-slate-600"
                      />
                    )}
                    <p className="text-sm text-slate-200 truncate max-w-[200px]">{targetFile.name}</p>
                    <p className="text-xs text-rose-500">Click to change</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-500 mb-2" />
                    <p className="text-sm text-slate-400">Upload photo to recreate</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleTargetChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </div>
            <div className="pt-4 border-t border-slate-700">
               <Button 
                onClick={handleGenerate} 
                disabled={!targetFile || sourceFiles.length === 0 || isGenerating}
                className="w-full"
                icon={<Wand2 className="w-4 h-4" />}
              >
                {isGenerating ? `Processing ${Math.round(progress)}%` : 'Generate Mosaic'}
              </Button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-8 bg-slate-950 p-8 flex items-center justify-center min-h-[500px] border border-slate-800 relative">
          
          {/* Default Empty State */}
          {!mosaicUrl && !isGenerating && !error && (
             <div className="text-center text-slate-600">
               <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
               <p>Select a target photo and generate to see the result</p>
             </div>
          )}

          {/* Loading State */}
          {isGenerating && (
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-rose-500 animate-spin mx-auto" />
              <p className="text-slate-300">Analysing pigments and composing...</p>
              <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden mx-auto">
                <div 
                  className="h-full bg-rose-600 transition-all duration-300" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isGenerating && (
            <div className="text-center space-y-4 max-w-md animate-fade-in">
              <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white">Generation Failed</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{error}</p>
              <div className="pt-2">
                <Button onClick={handleGenerate} variant="secondary">
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {mosaicUrl && !isGenerating && (
            <div className="flex flex-col items-center space-y-6 w-full animate-fade-in">
              <div className="relative group max-h-[60vh] overflow-hidden shadow-2xl border border-slate-800">
                <img src={mosaicUrl} alt="Mosaic Result" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-wrap gap-4 justify-center items-center">
                 <a 
                  href={mosaicUrl} 
                  download="mosaic-art.jpg"
                  className="inline-flex items-center justify-center px-6 py-3 text-sm font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white transition-colors border border-slate-600"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
                <Button 
                  onClick={generateAiTitle} 
                  isLoading={isAiThinking}
                  variant="secondary"
                  className="bg-indigo-900/50 text-indigo-200 hover:bg-indigo-900 border-indigo-800"
                  icon={<Wand2 className="w-4 h-4" />}
                >
                  AI Interpretation
                </Button>
              </div>
              {aiTitle && (
                <div className="animate-fade-in text-center space-y-2 max-w-lg">
                   <p className="text-xs uppercase tracking-widest text-indigo-400">Qwen2.5-VL Analysis (Modal A100)</p>
                   <h3 className="text-2xl font-serif text-white italic">"{aiTitle}"</h3>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};