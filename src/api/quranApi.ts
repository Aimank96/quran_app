import type { SurahInfo, SurahMeta, SurahDetailData, SearchResultsData, SearchMatch } from '../types/quran.ts';
import type { Lang } from '../context/LangContext.tsx';

export async function fetchAllSurahs(): Promise<SurahInfo[]> {
  const res = await fetch('/data/surahs.json');
  if (!res.ok) throw new Error('Failed to load surah list');
  return res.json();
}

export async function fetchSurahDetail(surahNumber: number): Promise<SurahDetailData> {
  const res = await fetch(`/data/surah-${surahNumber}.json`);
  if (!res.ok) throw new Error('Failed to load surah');
  return res.json();
}

let surahMetaData: SurahMeta[] | null = null;
let metaDataPromise: Promise<SurahMeta[]> | null = null;

export async function fetchSurahMeta(): Promise<SurahMeta[]> {
  if (surahMetaData) return surahMetaData;
  if (metaDataPromise) return metaDataPromise;
  metaDataPromise = fetch('/data/surah-metadata.json')
    .then(r => {
      if (!r.ok) throw new Error('Failed to load surah metadata');
      return r.json();
    })
    .then((data: SurahMeta[]) => {
      surahMetaData = data;
      return data;
    });
  return metaDataPromise;
}

// Client-side search using pre-built index
let msSearchIndex: SearchMatch[] | null = null;
let enSearchIndex: SearchMatch[] | null = null;
let loadingIndex: Promise<void> | null = null;

async function loadSearchIndex(lang: Lang): Promise<SearchMatch[]> {
  if (lang === 'ms') {
    if (msSearchIndex) return msSearchIndex;
  } else {
    if (enSearchIndex) return enSearchIndex;
  }

  if (!loadingIndex) {
    loadingIndex = Promise.all([
      fetch('/data/search-ms.json').then(r => r.json()),
      fetch('/data/search-en.json').then(r => r.json()),
    ]).then(([ms, en]) => {
      msSearchIndex = ms;
      enSearchIndex = en;
      loadingIndex = null;
    });
  }
  await loadingIndex;

  return lang === 'ms' ? msSearchIndex! : enSearchIndex!;
}

export async function searchQuran(keyword: string, lang: Lang): Promise<SearchResultsData> {
  const index = await loadSearchIndex(lang);
  const query = keyword.toLowerCase();
  const matches = index.filter((item) =>
    item.text.toLowerCase().includes(query)
  );
  return { count: matches.length, matches };
}
