import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Lang = 'ms' | 'en';

interface LangContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
}

const LangContext = createContext<LangContextType>({ lang: 'ms', setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem('quran-lang');
    return (saved === 'en' || saved === 'ms') ? saved : 'ms';
  });

  useEffect(() => {
    localStorage.setItem('quran-lang', lang);
  }, [lang]);

  return (
    <LangContext.Provider value={{ lang, setLang: setLangState }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
