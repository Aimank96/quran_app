import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { getStorage, ref, getBlob } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { buildAudioPath } from '../utils/audioUrl';
import { cacheAudio, getCachedAudio } from '../utils/audioCache';
import { RECITERS, type AudioState, type PlayingAyah, type Reciter } from '../types/audio';
import { useDownloadConsent } from './DownloadConsentContext';

interface AudioContextValue extends AudioState {
  playAyah: (surahNumber: number, ayahNumberInSurah: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  playEntireSurah: (surahNumber: number, totalAyahs: number) => void;
  setReciter: (reciter: Reciter) => void;
  isPlayingAyah: (surahNumber: number, ayahNumberInSurah: number) => boolean;
}

const AudioContext = createContext<AudioContextValue | null>(null);

const DEFAULT_STATE: AudioState = {
  status: 'idle',
  currentAyah: null,
  reciter: RECITERS[0],
  surahPlayMode: false,
  totalAyahsInSurah: 0,
  errorMessage: null,
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>(DEFAULT_STATE);
  // Use refs to access current state inside event handlers without stale closure
  const stateRef = useRef(state);
  stateRef.current = state;
  const { requestConsent, showDonationModal } = useDownloadConsent();
  const surahDownloadModeRef = useRef<boolean>(false);

  function getAudio(): HTMLAudioElement {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    return audioRef.current;
  }

  function clearAudioHandlers() {
    const audio = getAudio();
    audio.onended = null;
    audio.onerror = null;
    audio.oncanplay = null;
  }

  const playAyahInternal = useCallback(
    async (ayah: PlayingAyah, surahPlayMode: boolean, totalAyahs: number, reciter: Reciter) => {
      const audio = getAudio();
      clearAudioHandlers();
      audio.pause();

      const cacheKey = `${reciter.language}/${reciter.id}/${ayah.surahNumber}/${ayah.ayahNumberInSurah}`;

      setState((prev) => ({
        ...prev,
        status: 'loading',
        currentAyah: ayah,
        surahPlayMode,
        totalAyahsInSurah: totalAyahs,
        errorMessage: null,
      }));

      try {
        // If in surah play mode and not already in download mode, show donation modal first
        if (surahPlayMode && !surahDownloadModeRef.current) {
          console.log('[AudioContext] Surah mode - showing donation modal');
          surahDownloadModeRef.current = true;
          
          // Show donation modal and wait for user to close it
          await new Promise<void>((resolve) => {
            showDonationModal(() => {
              console.log('[AudioContext] Donation modal closed, continuing playback');
              resolve();
            });
          });
        }

        // Check cache first
        let blob = await getCachedAudio(cacheKey);
        console.log('[AudioContext] Cache check:', cacheKey, 'Found:', !!blob, 'surahPlayMode:', surahPlayMode);

        if (!blob) {
          console.log('[AudioContext] No cache, requesting consent...');
          // If in surah download mode, skip consent and download directly
          if (surahDownloadModeRef.current) {
            const auth = getAuth();
            if (!auth.currentUser) {
              setState((prev) => ({
                ...prev,
                status: 'error',
                errorMessage: 'Sila log masuk untuk mendengar audio',
              }));
              return;
            }

            const storage = getStorage();
            const path = buildAudioPath(reciter.language, reciter.id, ayah.surahNumber, ayah.ayahNumberInSurah);
            const storageRef = ref(storage, path);
            blob = await getBlob(storageRef);
            await cacheAudio(cacheKey, blob);
          } else {
            // Request user consent before downloading
            // If playing entire surah, always download entire surah (no option needed)
            const consent = await requestConsent(ayah.surahNumber, { 
              showSurahOption: !surahPlayMode // Only show option if NOT in surah play mode
            });
            if (!consent.accepted) {
              setState((prev) => ({
                ...prev,
                status: 'idle',
                currentAyah: null,
              }));
              return;
            }

            // If in surah play mode, download all ayahs (no option shown to user)
            if (surahPlayMode) {
              setState((prev) => ({
                ...prev,
                status: 'loading',
                errorMessage: 'Memuat turun seluruh surah...',
              }));

              for (let i = 1; i <= totalAyahs; i++) {
                const ayahCacheKey = `${reciter.language}/${reciter.id}/${ayah.surahNumber}/${i}`;
                const existingBlob = await getCachedAudio(ayahCacheKey);
                
                if (!existingBlob) {
                  const auth = getAuth();
                  if (!auth.currentUser) {
                    throw new Error('Sila log masuk untuk mendengar audio');
                  }

                  const storage = getStorage();
                  const path = buildAudioPath(reciter.language, reciter.id, ayah.surahNumber, i);
                  const storageRef = ref(storage, path);
                  const ayahBlob = await getBlob(storageRef);
                  await cacheAudio(ayahCacheKey, ayahBlob);
                }
              }

              // Now get the current ayah blob from cache
              blob = await getCachedAudio(cacheKey);
              if (!blob) {
                throw new Error('Failed to cache audio');
              }
            } else {
              // Download single ayah only
              const auth = getAuth();
              if (!auth.currentUser) {
                setState((prev) => ({
                  ...prev,
                  status: 'error',
                  errorMessage: 'Sila log masuk untuk mendengar audio',
                }));
                return;
              }

              const storage = getStorage();
              const path = buildAudioPath(reciter.language, reciter.id, ayah.surahNumber, ayah.ayahNumberInSurah);
              const storageRef = ref(storage, path);
              blob = await getBlob(storageRef);

              // Cache to device
              await cacheAudio(cacheKey, blob);
            }
          }
        }

        // Play from blob
        const url = URL.createObjectURL(blob);
        audio.src = url;

        audio.oncanplay = () => {
          audio.play().catch(() => {
            setState((prev) => ({
              ...prev,
              status: 'error',
              errorMessage: 'Gagal memainkan audio',
            }));
          });
          setState((prev) => ({ ...prev, status: 'playing' }));
        };

        audio.onerror = () => {
          setState((prev) => ({
            ...prev,
            status: 'error',
            errorMessage: 'Gagal memuat audio',
          }));
        };
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: err instanceof Error ? err.message : 'Ralat tidak diketahui',
        }));
      }

      audio.onended = () => {
        const cur = stateRef.current;
        if (cur.surahPlayMode && cur.currentAyah) {
          const nextAyah = cur.currentAyah.ayahNumberInSurah + 1;
          if (nextAyah <= cur.totalAyahsInSurah) {
            playAyahInternal(
              { surahNumber: cur.currentAyah.surahNumber, ayahNumberInSurah: nextAyah },
              true,
              cur.totalAyahsInSurah,
              cur.reciter
            );
            return;
          }
        }
        setState((prev) => ({
          ...prev,
          status: 'idle',
          currentAyah: null,
          surahPlayMode: false,
        }));
      };

      audio.onerror = () => {
        setState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: 'Audio tidak dapat dimuat. Sila periksa sambungan internet.',
        }));
      };

      audio.load();
    },
    []
  );

  function playAyah(surahNumber: number, ayahNumberInSurah: number) {
    playAyahInternal(
      { surahNumber, ayahNumberInSurah },
      false,
      stateRef.current.totalAyahsInSurah,
      stateRef.current.reciter
    );
  }

  function pause() {
    getAudio().pause();
    setState((prev) => ({ ...prev, status: 'paused' }));
  }

  function resume() {
    getAudio()
      .play()
      .then(() => setState((prev) => ({ ...prev, status: 'playing' })))
      .catch(() =>
        setState((prev) => ({ ...prev, status: 'error', errorMessage: 'Gagal meneruskan audio' }))
      );
  }

  function stop() {
    const audio = getAudio();
    clearAudioHandlers();
    audio.pause();
    audio.src = '';
    surahDownloadModeRef.current = false;
    setState({ ...DEFAULT_STATE, reciter: stateRef.current.reciter });
  }

  function playEntireSurah(surahNumber: number, totalAyahs: number) {
    playAyahInternal(
      { surahNumber, ayahNumberInSurah: 1 },
      true,
      totalAyahs,
      stateRef.current.reciter
    );
  }

  function setReciter(reciter: Reciter) {
    stop();
    setState((prev) => ({ ...prev, reciter }));
  }

  function isPlayingAyah(surahNumber: number, ayahNumberInSurah: number): boolean {
    const { currentAyah, status } = stateRef.current;
    return (
      (status === 'playing' || status === 'loading') &&
      currentAyah?.surahNumber === surahNumber &&
      currentAyah?.ayahNumberInSurah === ayahNumberInSurah
    );
  }

  return (
    <AudioContext.Provider
      value={{ ...state, playAyah, pause, resume, stop, playEntireSurah, setReciter, isPlayingAyah }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio(): AudioContextValue {
  const ctx = useContext(AudioContext);
  if (!ctx) throw new Error('useAudio must be used inside <AudioProvider>');
  return ctx;
}
