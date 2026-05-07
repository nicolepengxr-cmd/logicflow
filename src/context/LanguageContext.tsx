import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'EN' | 'ZH';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    nav_solver: 'PROBLEM SOLVER',
    nav_cleanslate: 'CLEANSATE',
    nav_mistakebook: 'MISTAKE BOOK',
    hero_title: 'MATH REVISION,',
    hero_subtitle: 'CLEANED UP.',
    hero_desc: 'LogicFlow helps DSE Math students clean messy textbook pages, solve questions in HKEAA-style steps, and turn mistakes into printable revision sets.',
    hero_start: 'START',
    hero_features: 'SEE FEATURES',
    feat_cleanslate_title: 'CleanSlate',
    feat_cleanslate_desc: 'Upload a marked-up textbook page. Get back a clean, printable version.',
    feat_solver_title: 'DSE Solver',
    feat_solver_desc: 'Input a Core, M1, or M2 question. Receive step-by-step working aligned with DSE marking logic.',
    feat_mistakebook_title: 'Mistake Book',
    feat_mistakebook_desc: 'Collect wrong questions automatically and export them into a revision set for tablet apps.',
    section_exam_title: 'BUILT FOR THE LAST STAGE BEFORE EXAMS.',
    section_exam_desc: 'LogicFlow is designed for students who need faster correction, cleaner materials, and more focused revision.',
    section_exam_btn: 'START WITH CLEANSLATE',
    solver_title: 'PROBLEM SOLVER',
    solver_upload: 'UPLOAD QUESTION PHOTO',
    solver_type: 'OR TYPE YOUR QUESTION',
    solver_placeholder: 'Solve x^2 - 5x + 6 = 0...',
    solver_btn: 'SOLVE WITH AI',
    solver_result_title: 'AI DSE-STYLE SOLUTION',
    solver_syllabus: 'Syllabus',
    solver_core: 'Core',
    solver_m1: 'M1',
    solver_m2: 'M2',
    back_home: 'BACK TO HOMEPAGE',
    footer_legal: 'Legal',
    footer_privacy: 'Privacy',
    footer_terms: 'Terms',
    cleanslate_title: 'CLEANSATE',
    mistakebook_title: 'MISTAKE BOOK',
    mistakebook_desc: 'Your marked mistakes will appear here. Upload new questions from the solver to see them.',
    mistakebook_generate: 'GENERATE REVISION SET',
    mistakebook_source: 'SOURCE LIBRARY',
    mistakebook_history: 'REVISION HISTORY',
    mistakebook_empty: 'Your collection is empty.',
    mistakebook_history_desc: 'Review your previously generated revision sets.',
    mistakebook_view_history: 'VIEW HISTORY',
    mistakebook_recent: 'RECENTLY GENERATED SET',
    mistakebook_no_sets: 'No revision sets generated yet.',
    privacy_title: 'PRIVACY POLICY',
    privacy_content: 'LogicFlow is a demo AI study tool for DSE Mathematics. Uploaded images and typed questions are used only to process the requested demo action.',
    privacy_section_1: 'Information we collect',
    privacy_section_2: 'How uploaded images are used',
    privacy_section_3: 'Data security',
    privacy_section_4: 'Contact',
    terms_title: 'TERMS OF USE',
    terms_content: 'LogicFlow is currently a demo product. AI-generated answers are for study support only and should not replace official HKEAA marking schemes, teachers, or school materials.',
    terms_section_1: 'Demo use',
    terms_section_2: 'Study support only',
    terms_section_3: 'User responsibility',
    terms_section_4: 'No guarantee of perfect accuracy',
    cleanslate_demo_label: 'DEMO CLEANUP RESULT — real handwriting removal model not connected yet.',
    cleanslate_new: 'START NEW',
    cleanslate_download: 'DOWNLOAD CLEANED PAGE'
  },
  ZH: {
    nav_solver: '解題工具',
    nav_cleanslate: '清頁工具',
    nav_mistakebook: '錯題本',
    hero_title: '數學複習，',
    hero_subtitle: '從此變得整潔。',
    hero_desc: 'LogicFlow 協助 DSE 數學科學生清除課本筆記、提供符合考評局標準的解題步驟，並將錯題轉化為可打印的複習集。',
    hero_start: '立即開始',
    hero_features: '查看功能',
    feat_cleanslate_title: '清頁工具',
    feat_cleanslate_desc: '上傳已寫過筆記的課本頁面，一鍵還原為乾淨的打印版本。',
    feat_solver_title: '解題工具',
    feat_solver_desc: '輸入核心或 M1/M2 題目，獲得符合 DSE 評分標準的詳細步驟。',
    feat_mistakebook_title: '錯題本',
    feat_mistakebook_desc: '自動收集錯題，並將其匯出為適用於 GoodNotes 或 Notability 的複習集。',
    section_exam_title: '為考試前最後衝刺而建。',
    section_exam_desc: 'LogicFlow 專為需要更快速糾錯、更整潔教材及更專注複習的學生而設。',
    section_exam_btn: '從清頁工具開始',
    solver_title: '解題工具',
    solver_upload: '上載題目圖片',
    solver_type: '或輸入題目',
    solver_placeholder: '例如：解 x^2 - 5x + 6 = 0...',
    solver_btn: '用 AI 解題',
    solver_result_title: 'AI DSE風格解題',
    solver_syllabus: '課程',
    solver_core: '核心',
    solver_m1: 'M1',
    solver_m2: 'M2',
    back_home: '返回首頁',
    footer_legal: '法律資訊',
    footer_privacy: '私隱政策',
    footer_terms: '使用條款',
    cleanslate_title: '清頁工具',
    mistakebook_title: '錯題本',
    mistakebook_desc: '在此查看你的錯題紀錄。從解題工具上傳新題目後會在此顯示。',
    mistakebook_generate: '生成複習集',
    mistakebook_source: '題目來源庫',
    mistakebook_history: '複習歷史',
    mistakebook_empty: '你的錯題庫目前是空的。',
    mistakebook_history_desc: '查看你之前生成的複習練習。',
    mistakebook_view_history: '查看歷史',
    mistakebook_recent: '最近生成的複習集',
    mistakebook_no_sets: '目前還沒有生成的複習集。',
    privacy_title: '私隱政策',
    privacy_content: 'LogicFlow 是一個為 DSE 數學而設的 AI 學習工具示範版本。用戶上載的圖片及輸入的題目，只會用於處理該次示範功能。',
    privacy_section_1: '我們收集的資料',
    privacy_section_2: '上載圖片的用途',
    privacy_section_3: '資料安全',
    privacy_section_4: '聯絡方式',
    terms_title: '使用條款',
    terms_content: 'LogicFlow 目前是示範產品。AI 生成的答案只供學習輔助用途，不能取代 HKEAA 官方評分準則、老師或學校教材。',
    terms_section_1: '示範用途',
    terms_section_2: '只供學習輔助',
    terms_section_3: '用戶責任',
    terms_section_4: '不保證完全準確',
    cleanslate_demo_label: '示範清理結果 — 真實筆跡清除模型尚未連接。',
    cleanslate_new: '重啟工具',
    cleanslate_download: '下載清除後頁面'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('EN');

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
