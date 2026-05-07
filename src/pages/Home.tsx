import { motion } from 'motion/react';
import { ArrowRight, Eraser, Calculator, BookmarkCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.5, ease: "circOut" } 
    },
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 40 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-accent selection:text-white">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="pt-40 pb-24 md:pt-60 md:pb-40 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="max-w-4xl"
            >
              <motion.h1 
                variants={itemVariants}
                className="font-display text-6xl md:text-[90px] leading-[1] font-medium tracking-tight mb-8"
              >
                {t('hero_title').charAt(0) + t('hero_title').slice(1).toLowerCase()}<br />
                <span className="text-accent italic">{t('hero_subtitle').charAt(0) + t('hero_subtitle').slice(1).toLowerCase()}</span>
              </motion.h1>
              
              <motion.p 
                variants={itemVariants}
                className="text-lg md:text-xl text-paper-dark/40 max-w-2xl mb-12 leading-relaxed font-light"
              >
                {t('hero_desc')}
              </motion.p>
 
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => navigate('/solver')}
                  className="group bg-accent text-white px-10 py-5 font-display text-sm font-bold uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:translate-x-1 hover:-translate-y-1 hover:shadow-[4px_4px_0_0_#000]"
                >
                  {t('hero_start')}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => {
                    const el = document.getElementById('feature-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-transparent text-paper-dark border-2 border-black/20 px-10 py-5 font-display text-sm font-bold uppercase tracking-widest hover:bg-paper-dark hover:text-white transition-all"
                >
                  {t('hero_features')}
                </button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Feature Preview Section */}
        <section id="feature-section" className="py-24 md:py-40 border-t border-black/5 bg-transparent">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border border-black/10 overflow-hidden bg-black/5 backdrop-blur-sm">
              <motion.div 
                {...fadeInUp}
                onClick={() => navigate('/cleanslate')}
                className="p-12 border-b md:border-b-0 md:border-r border-black/10 hover:bg-black/5 transition-colors duration-300 group cursor-pointer"
              >
                <div className="w-12 h-1 bg-accent mb-8" />
                <Eraser size={36} strokeWidth={1.5} className="mb-8 text-paper-dark/80" />
                <h3 className="font-display text-3xl font-medium tracking-tight mb-4 text-paper-dark/90">{t('feat_cleanslate_title')}</h3>
                <p className="text-base text-paper-dark/40 leading-relaxed font-light">
                  {t('feat_cleanslate_desc')}
                </p>
              </motion.div>

              <motion.div 
                {...fadeInUp}
                onClick={() => navigate('/solver')}
                className="p-12 border-b md:border-b-0 md:border-r border-black/10 hover:bg-black/5 transition-colors duration-300 group cursor-pointer"
              >
                <div className="w-12 h-0.5 bg-accent/40 mb-10" />
                <Calculator size={36} strokeWidth={1.5} className="mb-8 text-paper-dark/80" />
                <h3 className="font-display text-3xl font-medium tracking-tight mb-4 text-paper-dark/90">{t('feat_solver_title')}</h3>
                <p className="text-base text-paper-dark/40 leading-relaxed font-light">
                  {t('feat_solver_desc')}
                </p>
              </motion.div>

              <motion.div 
                {...fadeInUp}
                onClick={() => navigate('/mistakebook')}
                className="p-12 hover:bg-black/5 transition-colors duration-300 group cursor-pointer"
              >
                <div className="w-12 h-0.5 bg-accent/40 mb-10" />
                <BookmarkCheck size={36} strokeWidth={1.5} className="mb-8 text-paper-dark/80" />
                <h3 className="font-display text-3xl font-medium tracking-tight mb-4 text-paper-dark/90">{t('feat_mistakebook_title')}</h3>
                <p className="text-base text-paper-dark/40 leading-relaxed font-light">
                  {t('feat_mistakebook_desc')}
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Demo Entry Section */}
        <section className="py-24 md:py-60 px-6 bg-transparent overflow-hidden relative border-t border-black/5">
          <div className="absolute top-0 right-0 w-1/3 h-full bg-accent/5 skew-x-12 translate-x-20" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="max-w-3xl"
            >
              <h2 className="font-display text-5xl md:text-7xl font-medium tracking-tight mb-10 leading-[1.1] text-paper-dark">
                {t('section_exam_title').split('THE').map((part, i) => (
                  <span key={i}>
                    {language === 'EN' 
                      ? part.charAt(0) + part.slice(1).toLowerCase() 
                      : part}
                    {language === 'EN' && i === 0 && <span className="text-accent italic font-medium">the</span>}
                  </span>
                ))}
              </h2>
              <p className="text-lg md:text-xl text-paper-dark/40 mb-12 max-w-xl font-light leading-relaxed">
                {t('section_exam_desc')}
              </p>
              <button 
                onClick={() => navigate('/cleanslate')}
                className="bg-accent text-white px-12 py-6 font-display text-sm font-bold uppercase tracking-widest hover:opacity-90 transition-all transform hover:scale-105 active:scale-95 shadow-xl shadow-accent/20"
              >
                {t('section_exam_btn')}
              </button>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
