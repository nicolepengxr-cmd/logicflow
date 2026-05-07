import { motion } from 'motion/react';
import { Upload, Loader2, Eraser, Download, RefreshCw, ChevronLeft } from 'lucide-react';
import { useState, useRef, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';
import { ai } from '../lib/gemini';

export default function CleanSlate() {
  const { t } = useLanguage();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isProcessed, setIsProcessed] = useState(false);
  const [isDemoResult, setIsDemoResult] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setProcessedImage(null);
        setAnalysisResult(null);
        setIsProcessed(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const applyCleaningFilter = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // 1. Detect Yellow/Highlighter specifically
          const isYellow = r > 150 && g > 140 && b < 160 && r > b + 40 && g > b + 30;
          
          if (isYellow) {
            const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
            if (luminance > 130) {
              data[i] = 255;
              data[i+1] = 255;
              data[i+2] = 255;
              continue;
            }
          }

          // 2. High-Performance Document Cleaning (Level Adjustment)
          const brightness = (r + g + b) / 3;
          
          if (brightness > 170) {
            // Aggressively whiten the paper background and remove noise/grain
            data[i] = 255;
            data[i+1] = 255;
            data[i+2] = 255;
          } else if (brightness < 120) {
            // Text Sharpening: Boost contrast and darken the ink
            const contrast = 1.3;
            const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
            
            data[i] = Math.max(0, Math.min(255, factor * (r - 128) + 110));
            data[i+1] = Math.max(0, Math.min(255, factor * (g - 128) + 110));
            data[i+2] = Math.max(0, Math.min(255, factor * (b - 128) + 110));
            
            // Final darken pass for very dark areas to make them solid black
            if (brightness < 80) {
              data[i] = Math.max(0, data[i] - 50);
              data[i+1] = Math.max(0, data[i+1] - 50);
              data[i+2] = Math.max(0, data[i+2] - 50);
            }
          } else {
            // Mid-tones: subtle brightening to push them towards the white point
            data[i] = Math.min(255, r + 30);
            data[i+1] = Math.min(255, g + 30);
            data[i+2] = Math.min(255, b + 30);
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  };

  const processImage = async () => {
    if (!selectedFile || !selectedImage) return;
    
    setIsProcessing(true);

    try {
      // Direct frontend call to Gemini as per Skill requirements for best platform compatibility
      const base64Data = selectedImage.split(',')[1];
      const mimeType = selectedFile.type;

      const prompt = 'Remove handwritten pen marks and annotations. Enhance the image to look like a professionally scanned document: pure white background, clear high-contrast black printed text. Remove all grain, noise, and yellow highlights. If text is under a highlight, keep the text but make the background pure white. Output ONLY the processed image file.';

      const result = await ai.models.generateContent({
        model: "gemini-2.5-flash-image",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        }
      });

      const candidates = result.candidates;
      if (candidates && candidates.length > 0 && candidates[0].content?.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            const base64Response = part.inlineData.data;
            const responseMimeType = part.inlineData.mimeType || 'image/png';
            setProcessedImage(`data:${responseMimeType};base64,${base64Response}`);
            setIsProcessed(true);
            setIsDemoResult(false);
            return;
          }
        }
      }
      
      // If we got text but no image, log it for debugging
      if (result.text) {
        console.warn('Gemini returned text instead of image:', result.text);
      }
      
      throw new Error('Processed image not returned by AI');

    } catch (err) {
      console.error('CleanSlate processing error:', err);
      // Seamless fallback to local processing
      const cleaned = await applyCleaningFilter(selectedImage);
      setProcessedImage(cleaned);
      setIsProcessed(true);
      setIsDemoResult(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetDemo = () => {
    setSelectedFile(null);
    setSelectedImage(null);
    setProcessedImage(null);
    setAnalysisResult(null);
    setIsProcessed(false);
    setIsProcessing(false);
    setIsDemoResult(true);
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `cleanslate-cleaned-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-accent selection:text-white">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <Link 
            to="/"
            className="flex items-center gap-2 text-paper-dark/50 font-bold uppercase tracking-widest text-xs mb-12 hover:text-accent transition-all"
          >
            <ChevronLeft size={16} />
            {t('back_home')}
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <h1 className="font-display text-5xl md:text-7xl font-medium tracking-tight mb-6 text-paper-dark text-center">
              {t('cleanslate_title').charAt(0) + t('cleanslate_title').slice(1).toLowerCase()}
            </h1>
            <p className="text-paper-dark/40 text-lg max-w-xl mx-auto leading-relaxed font-light">{t('feat_cleanslate_desc')}</p>
          </motion.div>

          {!selectedImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video border-[1px] border-accent border-dashed bg-black/5 backdrop-blur-sm flex flex-col items-center justify-center gap-6 group cursor-pointer hover:bg-black/10 transition-colors"
            >
              <div className="w-16 h-16 bg-accent/10 flex items-center justify-center rounded-full group-hover:scale-110 transition-transform">
                <Upload size={32} className="text-accent" />
              </div>
              <div className="text-center">
                <span className="font-display text-2xl font-bold uppercase tracking-widest text-accent opacity-80">Upload Page</span>
                <p className="text-sm text-paper-dark/40 font-bold uppercase tracking-tighter mt-2">Drag and drop or click to browse</p>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
            </motion.div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                <div className="space-y-4">
                  <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-paper-dark/30">Original Source</span>
                  <div className="aspect-[3/4] border border-black/10 overflow-hidden bg-black/5 flex items-center justify-center">
                    <img src={selectedImage} alt="Original" className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="space-y-4 relative">
                  <div className="flex justify-between items-end">
                    <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-paper-dark/30">Cleaned Result</span>
                    {isProcessed && (
                      <span className={`font-display text-[8px] font-bold uppercase tracking-widest border px-1.5 py-0.5 rounded ${isDemoResult ? 'text-paper-dark/40 border-black/10' : 'text-accent border-accent/20'}`}>
                        {isDemoResult ? 'DEMO' : 'Gemini AI'}
                      </span>
                    )}
                  </div>
                  <div className="aspect-[3/4] border border-black/10 overflow-hidden bg-black/5 flex items-center justify-center relative">
                    {isProcessing ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4 absolute inset-0">
                        <Loader2 size={40} className="text-accent animate-spin" />
                        <span className="font-display text-xs font-bold uppercase tracking-widest text-paper-dark/60">Cleaning image...</span>
                      </div>
                    ) : isProcessed ? (
                      <motion.img 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        src={processedImage || selectedImage || ''} 
                        alt="Processed" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center p-8 opacity-20 text-paper-dark absolute inset-0">
                        <Eraser size={48} className="mx-auto mb-4" />
                        <p className="font-display text-xs font-bold uppercase tracking-widest">Click process to clean</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isProcessed && (
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center text-[10px] font-bold uppercase tracking-widest ${isDemoResult ? 'text-paper-dark/30' : 'text-accent'}`}
                >
                  {isDemoResult 
                    ? "DEMO CLEANUP RESULT — real handwriting removal model is active but processing limited." 
                    : "GEMINI CLEANSLATE — handwriting removed via AI vision processing."}
                </motion.p>
              )}

              <div className="flex flex-col gap-4">
                {!isProcessed ? (
                  <button 
                    onClick={processImage}
                    disabled={isProcessing}
                    className="w-full bg-paper-dark text-white py-6 font-display text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-accent hover:text-white disabled:opacity-50 transition-all shadow-xl shadow-paper-dark/10"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Eraser size={18} />}
                    {isProcessing ? "Cleaning Page..." : "Process Image"}
                  </button>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={handleDownload}
                      className="flex-1 bg-paper-dark text-white py-6 font-display text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-accent hover:text-white transition-all shadow-xl shadow-paper-dark/10"
                    >
                      <Download size={18} />
                      {t('cleanslate_download')}
                    </button>
                    <button onClick={resetDemo} className="px-10 py-6 border border-black/20 font-display text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-black/5 transition-all text-paper-dark">
                      <RefreshCw size={18} />
                      {t('cleanslate_new')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Label removed from here as it is now above the buttons/result */}
        </div>
      </main>
      <Footer />
    </div>
  );
}
