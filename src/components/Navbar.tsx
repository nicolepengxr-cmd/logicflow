import { motion } from 'motion/react';
import { Menu, X, ArrowRight, Globe, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const { user, signIn, logOut } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-3 focus:outline-none"
                >
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-full border border-black/5"
                  />
                  <div className="text-left hidden lg:block">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-paper-dark truncate max-w-[100px]">
                      {user.displayName?.split(' ')[0]}
                    </p>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-3 w-48 bg-white border border-black/10 shadow-xl p-2 flex flex-col gap-1"
                  >
                    <button 
                      onClick={() => {
                        logOut();
                        setIsUserMenuOpen(false);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors w-full text-left"
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <button 
                onClick={signIn}
                className="bg-paper-dark text-white px-4 py-2 font-display text-[10px] font-bold uppercase tracking-widest hover:bg-accent transition-colors"
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
              className="bg-paper-dark text-white w-full py-4 font-display text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors mt-4"
            >
              Sign In with Google
            </button>
          ) : (
            <button 
              onClick={() => {
                logOut();
                setIsMenuOpen(false);
              }}
              className="text-red-500 font-display text-sm font-bold uppercase tracking-widest flex items-center gap-2 mt-4"
            >
              <LogOut size={16} /> Sign Out
            </button>
          )}
        </motion.div>
      )}
    </nav>
  );
}
