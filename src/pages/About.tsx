import { motion } from 'motion/react';
import { ChevronLeft, Heart, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-transparent font-sans selection:bg-accent selection:text-white text-paper-dark">
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
            className="mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-[0.2em] mb-6">
              <Heart size={10} fill="currentColor" />
              {t('about_subtitle')}
            </div>
            
            <h1 className="font-display text-5xl md:text-8xl font-medium tracking-tight mb-8 text-paper-dark">
              {t('about_title')}
            </h1>
            
            <p className="text-paper-dark/60 text-xl md:text-2xl max-w-2xl leading-relaxed mb-16 font-light italic">
              "We're here to help you conquer the DSE, one clean page at a time."
            </p>

            <div className="grid gap-16 md:gap-24">
              <section className="relative">
                <div className="absolute -left-12 top-0 text-accent/20 hidden md:block">
                  <Sparkles size={48} />
                </div>
                <h3 className="font-display text-2xl md:text-3xl font-medium tracking-tight mb-6 text-paper-dark flex items-center gap-3">
                  {t('about_intro_title')}
                </h3>
                <p className="text-paper-dark/50 text-lg leading-relaxed max-w-3xl">
                  {t('about_intro_content')}
                </p>
              </section>

              <section>
                <h3 className="font-display text-2xl md:text-3xl font-medium tracking-tight mb-6 text-paper-dark flex items-center gap-3">
                  {t('about_story_title')}
                </h3>
                <div className="bg-black/5 p-8 md:p-12 border-l-4 border-accent">
                  <p className="text-paper-dark/50 text-lg leading-relaxed italic">
                    {t('about_story_content')}
                  </p>
                </div>
              </section>

              <section>
                <h3 className="font-display text-2xl md:text-3xl font-medium tracking-tight mb-6 text-paper-dark flex items-center gap-3">
                  {t('about_mission_title')}
                </h3>
                <p className="text-paper-dark/50 text-lg leading-relaxed max-w-3xl">
                  {t('about_mission_content')}
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
