import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function Terms() {
  const { t, language } = useLanguage();

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
            <h1 className="font-display text-5xl md:text-7xl font-medium tracking-tight mb-8 text-paper-dark">
              {t('terms_title').charAt(0) + t('terms_title').slice(1).toLowerCase()}
            </h1>
            <p className="text-paper-dark/40 text-lg max-w-2xl leading-relaxed mb-12 font-light">
              {t('terms_content')}
            </p>

            <div className="space-y-12 border-t border-black/10 pt-12">
              <section>
                <h3 className="font-display text-xl font-medium tracking-tight mb-4 text-paper-dark">{t('terms_section_1')}</h3>
                <p className="text-paper-dark/40 leading-relaxed">
                  {language === 'EN'
                    ? 'By using this application, you acknowledge that LogicFlow is a prototype designed to demonstrate AI-assisted math revision workflows. Features may change without notice.'
                    : '使用本應用程式即表示你確認 LogicFlow 是一個旨在展示 AI 輔助數學複習工作流程的原型。各項功能可能會在不另行通知的情況下更改。'}
                </p>
              </section>

              <section>
                <h3 className="font-display text-xl font-medium tracking-tight mb-4 text-paper-dark">{t('terms_section_2')}</h3>
                <p className="text-paper-dark/40 leading-relaxed">
                  {language === 'EN'
                    ? 'The solutions provided are intended to supplement student learning. Users should cross-reference all LogicFlow outputs with official HKEAA textbooks and past paper marking schemes.'
                    : '提供的解題步聚旨在作為學生學習的輔助。用戶應將 LogicFlow 的所有輸出與 HKEAA 官方課本及往年題目評分準則進行交叉對比。'}
                </p>
              </section>

              <section>
                <h3 className="font-display text-xl font-medium tracking-tight mb-4 text-paper-dark">{t('terms_section_3')}</h3>
                <p className="text-paper-dark/40 leading-relaxed">
                  {language === 'EN'
                    ? 'Users are responsible for the content they upload. LogicFlow reserves the right to terminate access if the tool is used to process inappropriate or non-educational materials.'
                    : '用戶需對其上載的內容負責。如果本工具被用於處理不當或非教育用途的資料，LogicFlow 保留終止訪問權限的權利。'}
                </p>
              </section>

              <section>
                <h3 className="font-display text-xl font-medium tracking-tight mb-4 text-paper-dark">{t('terms_section_4')}</h3>
                <p className="text-paper-dark/40 leading-relaxed">
                  {language === 'EN'
                    ? 'While we strive for excellence, AI models can occasionally produce incorrect steps or calculations (hallucinations). LogicFlow makes no guarantees regarding the 100% accuracy of its math solutions.'
                    : '雖然我們追求卓越，但 AI 模型偶爾可能會產生錯誤的步驟或計算（幻覺）。LogicFlow 不保證其數學解題的 100% 準確性。'}
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
