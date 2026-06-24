const STORAGE_BUCKET = 'quran-app-e5cb1.firebasestorage.app';

/**
 * Build the Firebase Storage path for a given ayah (for SDK usage).
 *
 * Storage structure:
 *   audio/arabic/{reciterId}/{surahPad}{ayahPad}.mp3   ← Arabic recitation
 *   audio/malay/{reciterId}/{surahPad}{ayahPad}.mp3    ← Future Malay recitation
 *
 * Example:
 *   audio/arabic/Alafasy_128kbps/001001.mp3
 */
export function buildAudioPath(
  language: 'arabic' | 'malay',
  reciterId: string,
  surahNumber: number,
  ayahNumberInSurah: number
): string {
  const surahPad = String(surahNumber).padStart(3, '0');
  const ayahPad  = String(ayahNumberInSurah).padStart(3, '0');
  return `audio/${language}/${reciterId}/${surahPad}${ayahPad}.mp3`;
}

/**
 * Build the Firebase Storage public URL for a given ayah (legacy, no longer used).
 */
export function buildAudioUrl(
  language: 'arabic' | 'malay',
  reciterId: string,
  surahNumber: number,
  ayahNumberInSurah: number
): string {
  const path = buildAudioPath(language, reciterId, surahNumber, ayahNumberInSurah);
  const encoded = encodeURIComponent(path);
  return `https://firebasestorage.googleapis.com/v0/b/${STORAGE_BUCKET}/o/${encoded}?alt=media`;
}
