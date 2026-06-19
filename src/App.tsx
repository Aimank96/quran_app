import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LangProvider } from './context/LangContext.tsx';
import { Header } from './components/Header.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { SurahPage } from './pages/SurahPage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <ScrollToTop />
        <div className="min-h-screen bg-stone-50">
          <Header />
          <main className="mx-auto max-w-5xl px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/surah/:surahNumber" element={<SurahPage />} />
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </LangProvider>
  );
}
