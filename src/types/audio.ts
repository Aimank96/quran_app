export type RecitationMode = 'arabic' | 'malay' | 'arabic-then-malay';

export const RECITATION_MODE_LABELS: Record<RecitationMode, string> = {
  'arabic': 'Bacaan Arab sahaja',
  'malay': 'Bacaan Malay sahaja',
  'arabic-then-malay': 'Arab kemudian Malay',
};

export interface Reciter {
  id: string;
  name: string;
  bitrate: string;
  language: 'arabic' | 'malay';
}

export interface PlayingAyah {
  surahNumber: number;
  ayahNumberInSurah: number;
}

export type AudioStatus = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface AudioState {
  status: AudioStatus;
  currentAyah: PlayingAyah | null;
  reciter: Reciter;
  surahPlayMode: boolean;
  totalAyahsInSurah: number;
  errorMessage: string | null;
  recitationMode: RecitationMode;
  activeLanguage: 'arabic' | 'malay';
}

export const RECITERS: Reciter[] = [
  // Arabic reciters — uploaded to Firebase Storage under audio/arabic/
  { id: 'Alafasy_128kbps',              name: 'Mishary Alafasy',                language: 'arabic', bitrate: '128kbps' },

  // Malay reciters — uploaded to Firebase Storage under audio/malay/
  { id: 'OsmanNeural', name: 'Osman (Terjemahan)', language: 'malay', bitrate: '128kbps' },
];
