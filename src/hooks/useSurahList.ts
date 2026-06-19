import { useState, useEffect, useMemo } from 'react';
import type { SurahInfo } from '../types/quran.ts';
import { fetchAllSurahs } from '../api/quranApi.ts';

let cachedSurahs: SurahInfo[] | null = null;
let cachePromise: Promise<SurahInfo[]> | null = null;

export function useSurahList() {
  const [surahs, setSurahs] = useState<SurahInfo[]>(cachedSurahs ?? []);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(!cachedSurahs);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedSurahs) return;
    if (cachePromise) return;

    cachePromise = fetchAllSurahs()
      .then((data) => {
        cachedSurahs = data;
        setSurahs(data);
        setLoading(false);
        return data;
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
        cachePromise = null;
        throw err;
      });
  }, []);

  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return surahs;
    const q = searchQuery.toLowerCase();
    return surahs.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.englishNameTranslation.toLowerCase().includes(q) ||
        s.name.includes(searchQuery) ||
        String(s.number) === searchQuery.trim()
    );
  }, [surahs, searchQuery]);

  return { surahs, filteredSurahs, searchQuery, setSearchQuery, loading, error };
}
