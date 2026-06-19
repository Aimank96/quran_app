export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  page: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface Edition {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction: string;
}

export interface SurahEdition {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: Ayah[];
  edition: Edition;
}

export interface SurahDetailData {
  arabic: SurahEdition;
  transliteration: SurahEdition;
  malay: SurahEdition;
  english: SurahEdition;
}

export interface SearchMatch {
  number: number;
  text: string;
  numberInSurah: number;
  surah: SurahInfo;
}

export interface SearchResultsData {
  count: number;
  matches: SearchMatch[];
}

export interface ApiResponse<T> {
  code: number;
  status: string;
  data: T;
}
