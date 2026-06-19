import { useSurahList } from '../hooks/useSurahList.ts';
import { SurahCard } from '../components/SurahCard.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';

export function HomePage() {
  const { filteredSurahs, searchQuery, setSearchQuery, loading, error } = useSurahList();

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="py-12 text-center text-red-600">
        <p>Gagal memuatkan senarai surah: {error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter input */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tapis surah mengikut nama atau nombor..."
          className="w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
        />
      </div>

      {/* Surah grid */}
      {filteredSurahs.length === 0 ? (
        <p className="py-8 text-center text-gray-500">Tiada surah sepadan dengan tapisan anda.</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredSurahs.map((surah) => (
            <SurahCard key={surah.number} surah={surah} />
          ))}
        </div>
      )}
    </div>
  );
}
