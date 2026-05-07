import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-20 px-6 border-t border-black/5 bg-black/5 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 text-paper-dark">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-accent flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rotate-45" />
              </div>
              <Link to="/" className="font-display font-bold text-2xl tracking-tighter uppercase transition-colors hover:text-accent text-paper-dark">LogicFlow</Link>
            </div>
            <p className="text-paper-dark/40 font-medium">AI study tools for DSE Math.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-2 gap-16">
            <div className="flex flex-col gap-4">
              <span className="font-display text-[10px] uppercase tracking-widest text-paper-dark/30 font-bold">App</span>
              <Link to="/solver" className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors text-paper-dark/50">{t('nav_solver')}</Link>
              <Link to="/cleanslate" className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors text-paper-dark/50">{t('nav_cleanslate')}</Link>
              <Link to="/mistakebook" className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors text-paper-dark/50">{t('nav_mistakebook')}</Link>
            </div>
            <div className="flex flex-col gap-4">
              <span className="font-display text-[10px] uppercase tracking-widest text-paper-dark/30 font-bold">{t('footer_legal')}</span>
              <Link to="/privacy" className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors text-paper-dark/50">{t('footer_privacy')}</Link>
              <Link to="/terms" className="text-sm font-bold uppercase tracking-wider hover:text-accent transition-colors text-paper-dark/50">{t('footer_terms')}</Link>
            </div>
          </div>
        </div>
        
        <div className="mt-20 pt-8 border-t border-black/5 flex flex-col md:flex-row justify-between gap-4">
          <span className="text-xs text-paper-dark/20 uppercase tracking-widest font-bold">© 2024 LogicFlow. All rights reserved.</span>
          <span className="text-xs text-paper-dark/20 uppercase tracking-widest font-bold">Made for HKDSE Students</span>
        </div>
      </div>
    </footer>
  );
}
