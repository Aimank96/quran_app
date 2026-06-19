import { useState, useEffect } from 'react';
import type { SearchResultsData } from '../types/quran.ts';
import { searchQuran } from '../api/quranApi.ts';
import type { Lang } from '../context/LangContext.tsx';

export function useSearch(keyword: string, lang: Lang) {
  const [results, setResults] = useState<SearchResultsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!keyword.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      setError(null);
      searchQuran(keyword.trim(), lang)
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((err: Error) => {
          setError(err.message);
          setLoading(false);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [keyword, lang]);

  return { results, loading, error };
}
