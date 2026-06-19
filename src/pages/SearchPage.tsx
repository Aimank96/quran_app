import { useSearchParams, Link } from 'react-router-dom';
import { useLang } from '../context/LangContext.tsx';
import { useSearch } from '../hooks/useSearch.ts';
import { SearchResults } from '../components/SearchResults.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get('q') ?? '';
  const { lang } = useLang();
  const { results, loading, error } = useSearch(keyword, lang);

  return (
    <div>
      <div className="mb-6">
        <Link to="/" className="text-sm text-emerald-600 hover:underline">
          ← Kembali ke Senarai Surah
        </Link>
        <h1 className="mt-2 text-xl font-semibold text-gray-900">
          Hasil carian{keyword ? ` untuk "${keyword}"` : ''}
        </h1>
        {results && (
          <p className="text-sm text-gray-500 mt-1">
            {results.count} hasil dijumpai
          </p>
        )}
      </div>

      {loading && <LoadingSpinner />}

      {error && (
        <div className="py-8 text-center text-red-600">
          <p>Carian gagal: {error}</p>
        </div>
      )}

      {!loading && !error && results && (
        <SearchResults matches={results.matches} keyword={keyword} />
      )}

      {!loading && !error && !results && keyword && (
        <p className="py-8 text-center text-gray-500">Taip untuk cari dalam Quran.</p>
      )}
    </div>
  );
}
