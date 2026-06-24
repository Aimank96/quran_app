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
}

export const RECITERS: Reciter[] = [
  // Arabic reciters — uploaded to Firebase Storage under audio/arabic/
  { id: 'Alafasy_128kbps',              name: 'Mishary Alafasy',                language: 'arabic', bitrate: '128kbps' },

  // Malay reciters — to be uploaded under audio/malay/ (coming soon)
  // { id: 'my_malay_reciter', name: 'Nama Qari', language: 'malay', bitrate: '128kbps' },
];
