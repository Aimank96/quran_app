export interface BookmarkData {
  surahNumber: number;
  ayahNumber: number; // numberInSurah
  arabicText: string;
  timestamp: number;
}

export interface NoteData {
  surahNumber: number;
  ayahNumber: number;
  note: string;
  timestamp: number;
}

// Document ID convention: "{surahNumber}_{ayahNumber}"
// Example: "1_1" = Surah 1, Ayah 1
export function bookmarkDocId(surahNumber: number, ayahNumber: number): string {
  return `${surahNumber}_${ayahNumber}`;
}
