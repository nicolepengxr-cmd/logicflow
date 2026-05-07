import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, ArrowRight, Globe, LogOut, ChevronDown } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, signIn, logOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b-[1px] border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between text-paper-dark">
        <Link to="/" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-accent flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter uppercase text-paper-dark">LogicFlow</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-10">
          <Link to="/solver" className="font-display text-sm font-bold uppercase tracking-widest text-paper-dark/60 hover:text-paper-dark transition-colors">
            {t('nav_solver')}
          </Link>
          <Link to="/cleanslate" className="font-display text-sm font-bold uppercase tracking-widest text-paper-dark/60 hover:text-paper-dark transition-colors">
            {t('nav_cleanslate')}
          </Link>
          <Link to="/mistakebook" className="font-display text-sm font-bold uppercase tracking-widest text-paper-dark/60 hover:text-paper-dark transition-colors">
            {t('nav_mistakebook')}
          </Link>
          <Link to="/about" className="font-display text-sm font-bold uppercase tracking-widest text-paper-dark/60 hover:text-paper-dark transition-colors">
            {t('footer_about')}
          </Link>
          
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-black/10">
            <Globe size={14} className="text-paper-dark/30" />
            <button 
              onClick={() => setLanguage('EN')}
              className={`text-[10px] font-bold tracking-widest transition-colors ${language === 'EN' ? 'text-accent' : 'text-paper-dark/40 hover:text-paper-dark'}`}
            >
              EN
            </button>
            <span className="text-paper-dark/20 text-[10px]">/</span>
            <button 
              onClick={() => setLanguage('ZH')}
              className={`text-[10px] font-bold tracking-widest transition-colors ${language === 'ZH' ? 'text-accent' : 'text-paper-dark/40 hover:text-paper-dark'}`}
            >
              繁中
            </button>
          </div>

          <div className="ml-4 pl-4 border-l border-black/10">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-black/5 transition-all group focus:outline-none border border-transparent hover:border-black/5"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=random`} 
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-full border border-black/10 shadow-sm group-hover:scale-105 transition-transform object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left hidden lg:flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-paper-dark leading-none">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                    <span className="text-[8px] text-paper-dark/40 uppercase tracking-tighter mt-0.5">
                      {user.email?.length > 20 ? user.email.slice(0, 18) + '...' : user.email}
                    </span>
                  </div>
                  <ChevronDown size={12} className={`text-paper-dark/40 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute right-0 mt-3 w-64 bg-white border border-black/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 flex flex-col gap-1 rounded-lg overflow-hidden"
                    >
                      <div className="px-4 py-3 mb-2 bg-paper-light/30 rounded-md">
                        <p className="text-[11px] font-bold text-paper-dark uppercase tracking-widest truncate">{user.displayName}</p>
                        <p className="text-[9px] text-paper-dark/50 font-medium truncate mt-0.5">{user.email}</p>
                      </div>
                      
                      <button 
                        onClick={() => {
                          logOut();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-[11px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors w-full text-left rounded-md group"
                      >
                        <LogOut size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button 
                onClick={signIn}
                className="bg-paper-dark text-white px-6 py-2.5 font-display text-[10px] font-bold uppercase tracking-widest hover:bg-accent hover:shadow-[0_4px_12px_rgba(157,78,221,0.3)] transition-all active:scale-95"
              >
                Sign In
              </button>
            )}
          </div>
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button 
            onClick={() => setLanguage(language === 'EN' ? 'ZH' : 'EN')}
            className="text-[10px] font-bold tracking-widest text-accent border border-accent/20 px-2 py-1"
          >
            {language === 'EN' ? '繁中' : 'EN'}
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} className="text-paper-dark" /> : <Menu size={24} className="text-paper-dark" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 left-0 right-0 bg-white border-b border-black/10 p-6 md:hidden flex flex-col gap-6 shadow-xl"
        >
          {user && (
            <div className="flex items-center gap-4 mb-2 pb-4 border-b border-black/5">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                alt={user.displayName || 'User'} 
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-display font-bold text-sm tracking-tight text-paper-dark">{user.displayName}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-paper-dark/40">{user.email}</p>
              </div>
            </div>
          )}
          
          <Link 
            to="/solver"
            onClick={() => setIsMenuOpen(false)}
            className="font-display text-left text-lg font-bold uppercase tracking-widest text-paper-dark flex items-center justify-between"
          >
            {t('nav_solver')} <ArrowRight size={18} />
          </Link>
          <Link 
            to="/cleanslate"
            onClick={() => setIsMenuOpen(false)}
            className="font-display text-left text-lg font-bold uppercase tracking-widest text-paper-dark flex items-center justify-between"
          >
            {t('nav_cleanslate')} <ArrowRight size={18} />
          </Link>
          <Link 
            to="/mistakebook"
            onClick={() => setIsMenuOpen(false)}
            className="font-display text-left text-lg font-bold uppercase tracking-widest text-paper-dark flex items-center justify-between"
          >
            {t('nav_mistakebook')} <ArrowRight size={18} />
          </Link>
          <Link 
            to="/about"
            onClick={() => setIsMenuOpen(false)}
            className="font-display text-left text-lg font-bold uppercase tracking-widest text-paper-dark flex items-center justify-between"
          >
            {t('footer_about')} <ArrowRight size={18} />
          </Link>

          {!user ? (
            <button 
              onClick={() => {
                signIn();
                setIsMenuOpen(false);
              }}
              className="bg-paper-dark text-white w-full py-4 font-display text-xs font-bold uppercase tracking-widest hover:bg-accent transition-all active:scale-95 shadow-lg shadow-black/5 mt-4 flex items-center justify-center gap-2"
            >
              Sign In with Google
            </button>
          ) : (
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-black/5">
              <button 
                onClick={() => {
                  logOut();
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-md text-red-500 bg-red-50 font-display text-xs font-bold uppercase tracking-widest hover:bg-red-100 transition-colors"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </motion.div>
      )}
    </nav>
  );
}
