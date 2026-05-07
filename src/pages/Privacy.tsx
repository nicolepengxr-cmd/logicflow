import { motion } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function Privacy() {
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
              {t('privacy_title').charAt(0) + t('privacy_title').slice(1).toLowerCase()}
            </h1>
            <p className="text-paper-dark/40 text-lg max-w-2xl leading-relaxed mb-12 font-light">
              {t('privacy_content')}
            </p>

            <div className="space-y-12 border-t border-black/10 pt-12">
              <section>
                <h3 className="font-display text-xl font-medium tracking-tight mb-4 text-paper-dark">{t('privacy_section_1')}</h3>
                <p className="text-paper-dark/40 leading-relaxed">
                  {language === 'EN' 
                    ? 'We collect images and text provided by users for the purpose of processing math questions. As a demo application, this data is processed in real-time and is not currently stored in a persistent user-facing database beyond the active session.'
                    : '我們收集用戶提供的圖片和文字，用於處理數學題目。作為一個示範應用程式，這些資料會被即時處理，目前除活動會話外，不會儲存在持久的用戶資料庫中。'}
                </p>
              </section>

              <section>
                <h3 className="font-display text-xl font-medium tracking-tight mb-4 text-paper-dark">{t('privacy_section_2')}</h3>
                <p className="text-paper-dark/40 leading-relaxed">
                  {language === 'EN'
                    ? 'Uploaded textbook pages are processed by our CleanSlate engine to remove ink and markings. Math questions are analyzed by our AI solver to provide step-by-step solutions aligned with DSE marking schemes.'
                    : '上載的課本頁面會經由我們的 CleanSlate 引擎處理以清除筆跡和標記。數學題目會由我們的 AI 解題器分析，以提供符合 DSE 評分標準的詳細步驟。'}
                </p>
              </section>

              <section>
                <h3 className="font-display text-xl font-medium tracking-tight mb-4 text-paper-dark">{t('privacy_section_3')}</h3>
                <p className="text-paper-dark/40 leading-relaxed">
                  {language === 'EN'
                    ? 'LogicFlow uses industry-standard encryption for data in transit. We recommend users do not upload documents containing sensitive personal information like full names, ID numbers, or home addresses.'
                    : 'LogicFlow 在資料傳輸過程中使用業界標準的加密技術。我們建議用戶不要上載包含敏感個人資料的文件，例如全名、身份證號碼或住址。'}
                </p>
              </section>

              <section>
                <h3 className="font-display text-xl font-medium tracking-tight mb-4 text-paper-dark">{t('privacy_section_4')}</h3>
                <p className="text-paper-dark/40 leading-relaxed">
                  {language === 'EN'
                    ? 'For questions regarding this demo application, please contact the LogicFlow demo team.'
                    : '如有關於此示範應用程式的疑問，請聯絡 LogicFlow 示範團隊。'}
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
