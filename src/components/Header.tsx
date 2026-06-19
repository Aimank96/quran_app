import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext.tsx';

export function Header() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { lang, setLang } = useLang();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link
          to="/"
          className="text-lg font-bold text-emerald-700 shrink-0 hover:text-emerald-800 transition"
        >
          Quran Reader
        </Link>

        <form onSubmit={handleSubmit} className="flex-1 max-w-md ml-auto">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari ayat..."
            className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
          />
        </form>

        {/* Language toggle */}
        <div className="flex items-center rounded-lg border border-stone-300 overflow-hidden shrink-0">
          <button
            onClick={() => setLang('ms')}
            className={`px-2.5 py-1 text-xs font-medium transition ${
              lang === 'ms'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-stone-100'
            }`}
          >
            BM
          </button>
          <button
            onClick={() => setLang('en')}
            className={`px-2.5 py-1 text-xs font-medium transition ${
              lang === 'en'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-gray-600 hover:bg-stone-100'
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  );
}
