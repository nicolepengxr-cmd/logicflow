import { motion, AnimatePresence } from 'motion/react';
import { BookmarkCheck, Download, ChevronLeft, Plus, Image as ImageIcon, Trash2, CheckCircle, FileText, Lock, LogIn } from 'lucide-react';
import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  addDoc, 
  deleteDoc, 
  doc, 
  updateDoc, 
  orderBy 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

interface Mistake {
  id: string;
  question: string;
  notes: string;
  image?: string | null;
  selected: boolean;
  createdAt: number;
  userId: string;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export default function MistakeBook() {
  const { t } = useLanguage();
  const { user, signIn, loading: authLoading } = useAuth();
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [question, setQuestion] = useState('');
  const [notes, setNotes] = useState('');
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
    const errInfo = {
      error: error instanceof Error ? error.message : String(error),
      operationType,
      path,
      authInfo: {
        userId: user?.uid,
        email: user?.email,
      }
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    alert(`${t('error_sync')}: ${errInfo.error}`);
  };

  // Load mistakes from Firestore
  useEffect(() => {
    if (!user) {
      setMistakes([]);
      return;
    }

    const q = query(
      collection(db, 'mistakes'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: Mistake[] = [];
      snapshot.forEach((doc) => {
        items.push({ id: doc.id, ...doc.data() } as Mistake);
      });
      setMistakes(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'mistakes');
    });

    return () => unsubscribe();
  }, [user]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addMistake = async (isImageOnly = false) => {
    if (!user) return;
    if (!isImageOnly && !question.trim()) return;
    if (isImageOnly && !uploadPreview) return;

    setIsSyncing(true);
    const path = 'mistakes';
    try {
      await addDoc(collection(db, path), {
        userId: user.uid,
        question: isImageOnly ? 'Image Question' : question,
        notes: notes,
        image: uploadPreview,
        selected: true,
        createdAt: Date.now(),
      });

      setQuestion('');
      setNotes('');
      setUploadPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 500); // Visual feedback
    }
  };

  const deleteMistake = async (id: string) => {
    const path = `mistakes/${id}`;
    try {
      await deleteDoc(doc(db, 'mistakes', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const toggleSelection = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'mistakes', id), {
        selected: !currentStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `mistakes/${id}`);
    }
  };

  const generatePDF = () => {
    const selectedMistakes = mistakes.filter(m => m.selected);
    if (selectedMistakes.length === 0) {
      alert('Please select at least one question to generate a review set.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups for this site to generate your revision set.');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>LogicFlow Revision Set</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap');
            
            * { box-sizing: border-box; }
            
            body { 
              font-family: 'Inter', system-ui, -apple-system, sans-serif; 
              padding: 50px; 
              background: #FCFAF7; 
              color: #1A1A1A;
              margin: 0;
            }
            
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
              border-bottom: 2px solid #1A1A1A;
              padding-bottom: 25px;
              margin-bottom: 50px;
            }
            
            .header h1 {
              font-family: 'Space Grotesk', sans-serif;
              font-size: 36px;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.1em;
            }
            
            .header p {
              font-size: 11px;
              color: rgba(0,0,0,0.5);
              margin: 8px 0 0 0;
              text-transform: uppercase;
              letter-spacing: 0.2em;
              font-weight: bold;
            }
            
            .mistake-item {
              margin-bottom: 60px;
              padding-bottom: 40px;
              border-bottom: 1px solid rgba(0,0,0,0.08);
              page-break-inside: avoid;
            }
            
            .mistake-number {
              display: inline-flex;
              padding: 6px 14px;
              background: #1A1A1A;
              color: white;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              font-family: 'Space Grotesk', sans-serif;
              margin-bottom: 20px;
              font-size: 14px;
            }
            
            .mistake-image-container {
              margin: 25px 0;
              background: white;
              padding: 15px;
              border: 1px solid rgba(0,0,0,0.05);
              display: inline-block;
              max-width: 100%;
            }
            
            .mistake-image {
              max-width: 100%;
              max-height: 500px;
              display: block;
            }
            
            .mistake-question {
              font-size: 20px;
              line-height: 1.7;
              margin-bottom: 25px;
              white-space: pre-wrap;
              color: #1A1A1A;
            }
            
            .mistake-notes {
              background: rgba(212, 163, 115, 0.08);
              padding: 25px;
              border-left: 4px solid #D4A373;
              font-size: 15px;
              font-style: italic;
              color: #4A4A4A;
              margin-top: 20px;
            }
            
            .mistake-notes-label {
              font-weight: 800;
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 0.2em;
              color: #D4A373;
              margin-bottom: 8px;
            }

            @media print {
              body { 
                padding: 30px; 
                background: white !important;
              }
              .mistake-item {
                border-bottom-color: rgba(0,0,0,0.2);
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>REVISION SET</h1>
              <p>Generated by LogicFlow AI — ${new Date().toLocaleDateString()}</p>
            </div>
            <div style="text-align: right;">
              <p style="color: #D4A373; font-weight: 800; font-size: 14px; margin-bottom: 5px;">DSE MATH</p>
              <p style="font-size: 10px;">LOGICFLOW.AI</p>
            </div>
          </div>
          
          <div class="mistakes-container">
            ${selectedMistakes.map((m, idx) => `
              <div class="mistake-item">
                <div class="mistake-number">PROBLEM 0${idx + 1}</div>
                ${m.image ? `
                  <div class="mistake-image-container">
                    <img src="${m.image}" class="mistake-image" alt="Problem ${idx + 1}" />
                  </div>
                ` : ''}
                <div class="mistake-question">${m.question}</div>
                ${m.notes ? `
                  <div class="mistake-notes">
                    <div class="mistake-notes-label">Student Analysis</div>
                    ${m.notes}
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>

          <script>
            function startPrint() {
              const images = document.images;
              let loadedCount = 0;
              
              const checkAllLoaded = () => {
                loadedCount++;
                if (loadedCount >= images.length) {
                  setTimeout(() => {
                    window.print();
                  }, 500);
                }
              };

              if (images.length === 0) {
                setTimeout(() => window.print(), 500);
              } else {
                for (let i = 0; i < images.length; i++) {
                  if (images[i].complete) {
                    checkAllLoaded();
                  } else {
                    images[i].onload = checkAllLoaded;
                    images[i].onerror = checkAllLoaded;
                  }
                }
              }
            }
            
            window.onload = startPrint;
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-4 border-accent border-t-transparent"
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-transparent font-sans text-paper-dark">
        <Navbar />
        <main className="pt-32 pb-20 px-6 flex items-center justify-center min-h-[80vh]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full p-12 border border-black/10 bg-white/50 backdrop-blur-md text-center shadow-2xl"
          >
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
              <Lock size={40} className="text-accent" />
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight mb-4 uppercase">Login Required</h2>
            <p className="text-paper-dark/50 text-sm mb-10 leading-relaxed">
              Please sign in with your Google account to access your personal Mistake Book and sync your data across devices.
            </p>
            <button 
              onClick={signIn}
              className="w-full bg-paper-dark text-white py-5 font-display text-sm font-bold uppercase tracking-[0.2em] hover:bg-accent transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95"
            >
              <LogIn size={20} />
              Sign in with Google
            </button>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-accent selection:text-white text-paper-dark">
      <Navbar />

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <Link 
              to="/"
              className="flex items-center gap-2 text-paper-dark/50 font-bold uppercase tracking-widest text-xs hover:text-accent transition-all"
            >
              <ChevronLeft size={16} />
              {t('back_home')}
            </Link>
            
            {isSyncing && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent animate-pulse">
                Syncing to Cloud...
              </span>
            )}
          </div>

          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <h1 className="font-display text-5xl md:text-7xl font-medium tracking-tight mb-4 text-paper-dark">
                {t('mistakebook_title')}
              </h1>
              <p className="text-paper-dark/40 text-lg max-w-xl leading-relaxed font-light">
                {t('mistakebook_desc')}
              </p>
            </motion.div>
            
            <div className="flex flex-col items-end gap-2">
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={generatePDF}
                disabled={mistakes.filter(m => m.selected).length === 0}
                className="bg-paper-dark text-white px-8 py-5 font-display text-sm font-bold uppercase tracking-[0.2em] hover:bg-accent hover:text-white transition-all active:scale-95 shadow-xl shadow-paper-dark/20 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <FileText size={18} />
                {t('mistakebook_generate')}
              </motion.button>
              {mistakes.length > 0 && mistakes.filter(m => m.selected).length === 0 && (
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest animate-pulse">
                  Select items to generate
                </span>
              )}
            </div>
          </header>

          {/* Input Form Section */}
          <section className="mb-20 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 border border-black/10 bg-white/50 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                  <Plus size={18} className="text-accent" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-widest text-paper-dark/80">Add Mistake</h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-paper-dark/40 mb-3">Question Content</label>
                  <textarea 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Type the question or main points here..."
                    className="w-full bg-black/5 border border-black/5 p-4 text-sm focus:outline-none focus:border-accent/30 transition-all min-h-[120px]"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-paper-dark/40 mb-3">Notes / Why I got it wrong</label>
                  <input 
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g., Careless with negative sign, formula mismatch..."
                    className="w-full bg-black/5 border border-black/5 p-4 text-sm focus:outline-none focus:border-accent/30 transition-all"
                  />
                </div>

                <button 
                  onClick={() => addMistake(false)}
                  disabled={!question.trim() || isSyncing}
                  className="w-full bg-paper-dark/5 text-paper-dark py-4 font-display text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all disabled:opacity-30"
                >
                  {isSyncing ? 'Processing...' : 'Confirm Addition'}
                </button>
              </div>
            </div>

            <div className="p-10 border border-black/10 bg-white/50 backdrop-blur-sm flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-paper-dark/5 flex items-center justify-center">
                  <ImageIcon size={18} className="text-paper-dark/40" />
                </div>
                <h3 className="font-display text-xl font-bold uppercase tracking-widest text-paper-dark/80">Capture Photo</h3>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 border-2 border-dashed border-black/5 flex flex-col items-center justify-center p-8 cursor-pointer hover:border-accent/20 hover:bg-accent/5 transition-all mb-6 group relative overflow-hidden"
              >
                {uploadPreview ? (
                  <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain absolute inset-0 p-4" />
                ) : (
                  <>
                    <ImageIcon size={32} className="text-paper-dark/10 mb-4 group-hover:text-accent/30 transition-all" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-paper-dark/30 group-hover:text-accent/50 transition-all">Click to Select Photo</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden" 
                />
              </div>

              <button 
                onClick={() => addMistake(true)}
                disabled={!uploadPreview || isSyncing}
                className="w-full bg-paper-dark/5 text-paper-dark py-4 font-display text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-accent hover:text-white transition-all disabled:opacity-30"
              >
                {isSyncing ? 'Uploading...' : 'Upload & Add'}
              </button>
            </div>
          </section>

          {/* Library Section */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-10 border-b border-black/5 pb-6">
              <div className="flex items-center gap-4">
                <h2 className="font-display text-2xl font-medium tracking-tight text-paper-dark">{t('mistakebook_source')}</h2>
                <span className="bg-paper-dark/5 text-paper-dark/40 text-[10px] px-2 py-0.5 font-bold rounded-full">
                  {mistakes.length} ITEMS
                </span>
              </div>
              
              {mistakes.length > 0 && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      mistakes.forEach(m => {
                        if (!m.selected) toggleSelection(m.id, false);
                      });
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-paper-dark/40 hover:text-accent transition-all"
                  >
                    Select All
                  </button>
                  <button 
                    onClick={() => {
                      mistakes.forEach(m => {
                        if (m.selected) toggleSelection(m.id, true);
                      });
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest text-paper-dark/40 hover:text-accent transition-all"
                  >
                    Deselect All
                  </button>
                </div>
              )}
            </div>

            {mistakes.length === 0 ? (
              <div className="py-20 text-center border border-black/5 bg-black/[0.02]">
                <BookmarkCheck size={48} className="mx-auto mb-6 text-paper-dark/10" />
                <p className="text-sm text-paper-dark/30 italic leading-relaxed">{t('mistakebook_empty')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {mistakes.map((mistake) => (
                    <motion.div
                      key={mistake.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`group relative p-6 border transition-all ${mistake.selected ? 'border-accent bg-accent/[0.03]' : 'border-black/5 bg-white/30'}`}
                    >
                      <div className="flex justify-between items-start mb-6">
                        <button 
                          onClick={() => toggleSelection(mistake.id, mistake.selected)}
                          className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${mistake.selected ? 'bg-accent border-accent text-white' : 'border-black/10 text-transparent hover:border-accent'}`}
                        >
                          <CheckCircle size={14} />
                        </button>
                        <button 
                          onClick={() => deleteMistake(mistake.id)}
                          className="opacity-0 group-hover:opacity-100 text-paper-dark/20 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {mistake.image && (
                        <div className="aspect-video mb-4 border border-black/5 bg-white p-2 overflow-hidden">
                          <img src={mistake.image} alt="Mistake" className="w-full h-full object-contain" />
                        </div>
                      )}

                      <h4 className="font-display text-base font-medium text-paper-dark mb-2 line-clamp-2">
                        {mistake.question}
                      </h4>
                      {mistake.notes && (
                        <p className="text-xs text-paper-dark/40 italic line-clamp-3 leading-relaxed mb-4">
                          {mistake.notes}
                        </p>
                      )}
                      
                      <div className="mt-auto pt-4 border-t border-black/5 flex items-center justify-between">
                        <span className="text-[8px] font-bold uppercase tracking-widest text-paper-dark/20">
                          {new Date(mistake.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="p-12 border border-black/10 bg-black/5 backdrop-blur-sm">
              <Download size={32} className="mb-6 text-paper-dark" />
              <h3 className="font-display text-2xl font-medium tracking-tight mb-4">{t('mistakebook_history')}</h3>
              <p className="text-sm text-paper-dark/50 mb-8 leading-relaxed">{t('mistakebook_history_desc')}</p>
              <div className="inline-block text-[10px] font-bold uppercase tracking-widest border-b border-current pb-1 cursor-not-allowed opacity-30">
                {t('mistakebook_view_history')} (COMING SOON)
              </div>
            </div>
            
            <div className="p-12 border border-black/10 bg-paper-dark text-white transition-all">
              <FileText size={32} className="mb-6 text-white" />
              <h3 className="font-display text-2xl font-medium tracking-tight mb-4">Print-Ready</h3>
              <p className="text-sm text-white/60 mb-8 leading-relaxed">
                Your selected questions are automatically formatted into a high-quality PDF, perfect for printing or importing into iPad apps like GoodNotes.
              </p>
              <button 
                onClick={generatePDF}
                disabled={mistakes.filter(m => m.selected).length === 0}
                className="inline-block text-[10px] font-bold uppercase tracking-widest border-b border-current pb-1 hover:text-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Format Selection Now
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
