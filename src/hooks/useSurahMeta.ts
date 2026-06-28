import { useState, useEffect } from 'react';
import type { SurahMeta } from '../types/quran.ts';
import { fetchSurahMeta } from '../api/quranApi.ts';

export function useSurahMeta(surahNumber: number) {
  const [meta, setMeta] = useState<SurahMeta | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSurahMeta().then((data) => {
      if (!cancelled && surahNumber >= 1 && surahNumber <= data.length) {
        setMeta(data[surahNumber - 1]);
      }
    }).catch(() => {
      // silently fail — metadata is optional enrichment
    });
    return () => { cancelled = true; };
  }, [surahNumber]);

  return meta;
}
