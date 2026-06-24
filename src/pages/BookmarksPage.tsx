import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../hooks/useBookmarks';
import { LoginButton } from '../components/LoginButton';
import { LoadingSpinner } from '../components/LoadingSpinner';

export function BookmarksPage() {
  const { user } = useAuth();
  const { bookmarks, toggleBookmark, loading } = useBookmarks();

  if (!user) {
    return (
      <div className="py-16 text-center">
        <p className="mb-2 text-lg font-semibold text-gray-700">Log masuk untuk melihat penanda anda</p>
        <p className="mb-6 text-sm text-gray-500">Penanda anda akan disimpan dan disegerakkan merentas peranti.</p>
        <div className="flex justify-center">
          <LoginButton />
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner />;

  if (bookmarks.size === 0) {
    return (
      <div className="py-16 text-center">
        <svg className="mx-auto mb-4 h-12 w-12 text-stone-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3-7 3V5z" />
        </svg>
        <p className="text-lg font-semibold text-gray-600">Tiada penanda lagi</p>
        <p className="mt-1 text-sm text-gray-400">Tandai mana-mana ayat semasa membaca surah.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-emerald-600 underline hover:text-emerald-700">
          Pergi ke senarai surah
        </Link>
      </div>
    );
  }

  // Group bookmarks by surah
  const bySurah = new Map<number, Array<{ id: string; ayahNumber: number; arabicText: string }>>();
  bookmarks.forEach((bm, id) => {
    const list = bySurah.get(bm.surahNumber) ?? [];
    list.push({ id, ayahNumber: bm.ayahNumber, arabicText: bm.arabicText });
    bySurah.set(bm.surahNumber, list);
  });

  const sortedSurahs = Array.from(bySurah.entries()).sort(([a], [b]) => a - b);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Penanda Saya</h1>
      <div className="space-y-6">
        {sortedSurahs.map(([surahNumber, ayahs]) => (
          <div key={surahNumber} className="rounded-xl border border-stone-200 bg-white shadow-sm">
            <div className="border-b border-stone-100 px-4 py-3">
              <Link
                to={`/surah/${surahNumber}`}
                className="text-base font-semibold text-emerald-700 hover:underline"
              >
                Surah {surahNumber}
              </Link>
            </div>
            <ul className="divide-y divide-stone-100">
              {ayahs.sort((a, b) => a.ayahNumber - b.ayahNumber).map((bm) => (
                <li key={bm.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                    {bm.ayahNumber}
                  </span>
                  <p className="flex-1 font-arabic text-lg leading-relaxed text-gray-800 text-right" dir="rtl" lang="ar">
                    {bm.arabicText.length > 120 ? bm.arabicText.slice(0, 120) + '…' : bm.arabicText}
                  </p>
                  <div className="flex shrink-0 flex-col gap-1">
                    <Link
                      to={`/surah/${surahNumber}`}
                      className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Baca
                    </Link>
                    <button
                      onClick={() => toggleBookmark(surahNumber, bm.ayahNumber, bm.arabicText)}
                      className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
                    >
                      Buang
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
