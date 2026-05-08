import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Calculator, ChevronLeft, Loader2, Upload, Bookmark, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

const GEMINI_API_KEY = "AIzaSyApSv3sTs_yf-KrzQu_69s5PlU3gur4v8Q";
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

type Syllabus = 'Core' | 'M1' | 'M2';

export default function Solver() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [solverInput, setSolverInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const [solverResult, setSolverResult] = useState<string[] | null>(null);
  const [isRealAI, setIsRealAI] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const solveQuestion = async () => {
    if (!solverInput.trim() && !selectedFile) return;
    
    setIsSolving(true);
    setSolverResult(null);
    setIsRealAI(false);
    setIsSaved(false);

    try {
      const parts: any[] = [];
      
      if (selectedFile) {
        const base64Data = await fileToBase64(selectedFile);
        parts.push({
          inlineData: {
            data: base64Data,
            mimeType: selectedFile.type
          }
        });
      }

      if (solverInput.trim()) {
        parts.push({ text: solverInput });
      } else if (selectedFile) {
        parts.push({ text: "Please solve the math question in this image." });
      }

      const systemPrompt = `You are a DSE Mathematics expert. You must answer strictly following HKEAA marking scheme format. Show M marks (method), A marks (accuracy), and R marks (reasoning) for every step. Never skip steps. Always show working clearly.

      Here are real DSE marking scheme examples for reference:
      1. Coordinate Geometry (Circle & Tangent):
         - Use $163-10a+b=0$ if point lies on $C$. [1M]
         - $25x^2+(9a+640)x+(90a+4924)=0$ by substituting line into circle. [1M]
         - Use equal roots condition: $(9a+640)^2-4(25)(90a+4924)=0$. [1M]
         - $a=20, b=37$. [1A]

      2. Statistics & 3D Geometry:
         - Cosine formula: $QS^2=12^2+10^2-2(12)(10)\cos 82^\circ$. [1M]
         - Shortest distance from $R$ to plane $PQS$: $h = (13\sin\angle RQS)\sin 80^\circ$. [1M]

      3. Polynomials:
         - $F(-1)=-12$ and $F(2)=0$. [1M+1M]
         - Solve $q-r=-2$ and $2q+r=5$ to get $q=1, r=3$. [1A]
         - Irrational roots: $x = \frac{-1 \pm \sqrt{97}}{12}$. [1M, 1A]`;

      const isEN = language === 'EN';
      const systemInstruction = isEN 
        ? `${systemPrompt} 
           Solve the student's question in clear step-by-step working using HKEAA marking style. Use concise English.

           Strict output format:
           Step 1: [M1] [Description of the step]
           [Mathematical working]
           
           Step 2: [M1/A1] [Description of the next step]
           [Mathematical working]
           
           Final Answer: [A1] [The final result]

           Rules:
           - Every step MUST have a mark type: [M1], [A1], [M2], [A2] or [R1].
           - Show every single logical transition. Do not skip calculations.
           - Use LaTeX for ALL math, wrapped in $ (e.g. $x = 2$).
           - If an image is provided, focus on the math problem identified in it.
           - If the input is invalid, say 'Please enter or upload a valid math question.'`
        : `${systemPrompt}
           你是一位 DSE 數學專家。你必須嚴格按照 HKEAA 評分準則格式回答。每一步都必須顯示 M 分（過程分）、A 分（答案分）和 R 分（解釋分）。切勿跳過步驟。務必清晰顯示解題過程。
           
           嚴格輸出格式：
           步驟 1：[M1] [步驟說明]
           [數學運算過程]

           步驟 2：[M1/A1] [下一步說明]
           [數學運算過程]

           最終答案：[A1] [最終結果]

           規則：
           - 每一步都必須標記分數類型：[M1], [A1], [M2], [A2] 或 [R1]。
           - 顯示每一個邏輯轉換。不要省略計算過程。
           - 所有數學公式必須使用 LaTeX 並用 $ 包裹（例如 $x = 2$）。
           - 如果提供圖片，請針對圖片中的數學問題進行解答。
           - 如果輸入無效，請回覆「請輸入或上傳有效的數學題目。」`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: { parts: parts },
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.1, // Set to low for consistent mathematical output
        },
      });

      const text = response.text;
      if (text) {
        if (text.includes('Please enter or upload a valid math question') || text.includes('請輸入或上傳有效的數學題目')) {
          setSolverResult([isEN ? 'Please enter or upload a valid math question.' : '請輸入或上傳有效的數學題目。']);
          setIsRealAI(false);
          return;
        }
        
        // Split by the start of each step to handle multi-line content within steps
        const formattedSteps = text.split(/\n(?=Step \d+:|步驟 \d+：|Final Answer:|最終答案：)/i)
          .filter((line: string) => line.trim().length > 0)
          .map((line: string) => line.trim());
        
        setSolverResult(formattedSteps);
        setIsRealAI(true);
      } else {
        throw new Error("No response from AI");
      }
    } catch (err) {
      console.error("AI Solver Error:", err);
      setSolverResult([language === 'EN' 
        ? "Error: Failed to connect to the AI service. Please try again later or check your network connection." 
        : "錯誤：無法連接至 AI 服務。請稍後再試或檢查您的網路連線。"]);
      setIsRealAI(false);
    } finally {
      setIsSolving(false);
    }
  };

  const saveToMistakeBook = async () => {
    if (!user || !solverResult) return;

    try {
      await addDoc(collection(db, 'mistakes'), {
        userId: user.uid,
        question: solverInput || (selectedFile ? 'Image Solver Request' : 'Math Problem'),
        notes: `Extracted Solution Steps:\n${solverResult.join('\n')}`,
        image: imagePreview,
        selected: true,
        createdAt: Date.now()
      });
      setIsSaved(true);
    } catch (error) {
      console.error('Error saving mistake:', error);
      alert('Failed to save to Mistake Book. Please check your connection.');
    }
  };

  const resetSolver = () => {
    setSolverInput('');
    setSelectedFile(null);
    setImagePreview(null);
    setIsSolving(false);
    setSolverResult(null);
    setIsRealAI(false);
    setIsSaved(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-accent selection:text-white">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <Link 
            to="/"
            className="flex items-center gap-2 text-paper-dark/50 font-bold uppercase tracking-widest text-xs mb-12 hover:text-accent transition-all"
          >
            <ChevronLeft size={16} />
            {t('back_home')}
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="font-display text-5xl md:text-7xl font-medium tracking-tight mb-4 text-paper-dark">
              {t('solver_title').charAt(0) + t('solver_title').slice(1).toLowerCase()}
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Upload Area */}
            <div>
              <span className="block font-display text-[10px] font-bold uppercase tracking-[0.3em] text-paper-dark/30 mb-4">{t('solver_upload')}</span>
              {!imagePreview ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-[250px] border-[1px] border-accent border-dashed bg-black/5 backdrop-blur-sm flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-black/10 transition-colors"
                >
                  <Upload size={24} className="text-accent group-hover:scale-110 transition-transform" />
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange}
                    className="hidden" 
                    accept="image/*" 
                  />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full h-[250px] relative group border border-black/20 overflow-hidden"
                >
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-contain bg-black/5" />
                  <button 
                    onClick={() => { setSelectedFile(null); setImagePreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                    className="absolute top-2 right-2 bg-paper-dark text-white px-3 py-1 font-display text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Remove
                  </button>
                </motion.div>
              )}
            </div>

            {/* Text Area */}
            <div className="flex flex-col">
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.3em] text-paper-dark/30 mb-4">{t('solver_type')}</span>
              <textarea 
                value={solverInput}
                onChange={(e) => setSolverInput(e.target.value)}
                placeholder={t('solver_placeholder')}
                className="w-full flex-grow border-[1px] border-black/10 bg-black/5 backdrop-blur-sm p-6 font-display text-lg focus:outline-none focus:border-accent focus:bg-black/10 transition-all resize-none placeholder:opacity-20 text-paper-dark"
              />
            </div>
          </div>

          <button 
            onClick={solveQuestion}
            disabled={(!solverInput.trim() && !selectedFile) || isSolving} 
            className="w-full bg-paper-dark text-white py-6 font-display text-sm font-bold uppercase tracking-widest hover:bg-accent hover:text-white disabled:opacity-30 disabled:cursor-not-allowed mb-20 flex items-center justify-center gap-3 transition-all shadow-xl shadow-paper-dark/10"
          >
            {isSolving ? <Loader2 className="animate-spin" /> : <Calculator size={18} />}
            {isSolving ? "..." : t('solver_btn')}
          </button>
          
          <AnimatePresence>
            {solverResult && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-black/10 pt-12"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <p className="text-paper-dark/30 font-bold uppercase tracking-[0.3em] text-[10px]">
                      {t('solver_result_title')}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] ${isRealAI ? 'bg-paper-dark text-white' : 'bg-accent text-white'}`}>
                      {isRealAI ? 'AI' : 'DEMO'}
                    </span>
                  </div>
                  
                  {user && isRealAI && (
                    <button 
                      onClick={saveToMistakeBook}
                      disabled={isSaved}
                      className={`flex items-center gap-2 px-4 py-2 border font-display text-[10px] font-bold uppercase tracking-widest transition-all ${isSaved ? 'bg-green-50 border-green-200 text-green-600' : 'border-accent/30 text-accent hover:bg-accent hover:text-white'}`}
                    >
                      {isSaved ? <Check size={14} /> : <Bookmark size={14} />}
                      {isSaved ? 'Saved to Book' : 'Bookmark Solution'}
                    </button>
                  )}
                </div>

                <div className="space-y-6">
                  {solverResult.map((step, i) => {
                    const isFinal = step.toLowerCase().startsWith('final answer') || step.startsWith('最終答案');
                    
                    const renderContent = (content: string) => {
                      return (
                        <div className="markdown-body">
                          <ReactMarkdown 
                            remarkPlugins={[remarkMath]} 
                            rehypePlugins={[rehypeKatex]}
                          >
                            {content}
                          </ReactMarkdown>
                        </div>
                      );
                    };

                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className={`flex flex-col gap-2 p-6 border border-black/5 ${isFinal ? 'bg-accent text-white font-bold shadow-[0_0_20px_rgba(108,99,255,0.2)]' : 'bg-black/5 backdrop-blur-sm'}`}
                      >
                        <div className="flex justify-between items-start">
                          {!isFinal && (
                            <span className="font-display font-medium text-accent text-[10px] uppercase tracking-[0.3em]">
                              {language === 'EN' ? `Step ${i + 1}` : `步驟 ${i + 1}`}
                            </span>
                          )}
                        </div>
                        <div className="leading-relaxed text-lg whitespace-pre-wrap">
                          {renderContent(step.replace(/^Step \d+: /i, '').replace(/^步驟 \d+：/i, '').replace(/^Final Answer: /i, '').replace(/^最終答案：/i, ''))}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                <button onClick={resetSolver} className="mt-8 text-[10px] font-bold uppercase tracking-widest text-paper-dark/30 hover:text-accent transition-colors">
                  Clear
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <Footer />
    </div>
  );
}
