import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LangProvider } from './context/LangContext.tsx';
import { AudioProvider } from './context/AudioContext.tsx';
import { Header } from './components/Header.tsx';
import { AudioPlayerBar } from './components/AudioPlayerBar.tsx';
import { HomePage } from './pages/HomePage.tsx';
import { SurahPage } from './pages/SurahPage.tsx';
import { SearchPage } from './pages/SearchPage.tsx';
import { BookmarksPage } from './pages/BookmarksPage.tsx';
import { useAudio } from './context/AudioContext.tsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppLayout() {
  const { status } = useAudio();
  const isAudioActive = status !== 'idle';

  return (
    <div className="min-h-screen bg-stone-50">
      <Header />
      <main className={`mx-auto max-w-5xl px-4 py-8 ${isAudioActive ? 'pb-28' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/surah/:surahNumber" element={<SurahPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
        </Routes>
      </main>
      <AudioPlayerBar />
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AudioProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AppLayout />
        </BrowserRouter>
      </AudioProvider>
    </LangProvider>
  );
}
