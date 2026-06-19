import { useState, useEffect } from 'react';
import type { SurahDetailData } from '../types/quran.ts';
import { fetchSurahDetail } from '../api/quranApi.ts';

export function useSurahDetail(surahNumber: number) {
  const [surahData, setSurahData] = useState<SurahDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setSurahData(null);

    fetchSurahDetail(surahNumber)
      .then((data) => {
        if (!cancelled) {
          setSurahData(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [surahNumber]);

  return { surahData, loading, error };
}
