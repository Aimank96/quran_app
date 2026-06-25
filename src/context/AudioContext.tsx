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
import { RECITERS, type AudioState, type PlayingAyah, type Reciter, type RecitationMode } from '../types/audio';
import { useDownloadConsent } from './DownloadConsentContext';

interface AudioContextValue extends AudioState {
  playAyah: (surahNumber: number, ayahNumberInSurah: number) => void;
  playAyahWithReciter: (surahNumber: number, ayahNumberInSurah: number, reciter: Reciter) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  playEntireSurah: (surahNumber: number, totalAyahs: number, mode?: RecitationMode) => void;
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
  recitationMode: 'arabic',
  activeLanguage: 'arabic',
};

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioState>(DEFAULT_STATE);
  // Use refs to access current state inside event handlers without stale closure
  const stateRef = useRef(state);
  stateRef.current = state;
  const activeLanguageRef = useRef<'arabic' | 'malay'>('arabic');
  const { requestConsent, showDonationModal } = useDownloadConsent();
  const surahDownloadModeRef = useRef<boolean>(false);

  function getReciterForLanguage(language: 'arabic' | 'malay'): Reciter {
    return RECITERS.find(r => r.language === language)!;
  }

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
    async (ayah: PlayingAyah, surahPlayMode: boolean, totalAyahs: number, reciter: Reciter, mode: RecitationMode = 'arabic') => {
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

              // Determine which languages to download based on mode
              const languages: Array<'arabic' | 'malay'> =
                mode === 'arabic-then-malay'
                  ? ['arabic', 'malay']
                  : [mode === 'malay' ? 'malay' : 'arabic'];

              for (const lang of languages) {
                const langReciter = getReciterForLanguage(lang);
                for (let i = 1; i <= totalAyahs; i++) {
                  const ayahCacheKey = `${langReciter.language}/${langReciter.id}/${ayah.surahNumber}/${i}`;
                  const existingBlob = await getCachedAudio(ayahCacheKey);
                  
                  if (!existingBlob) {
                    const auth = getAuth();
                    if (!auth.currentUser) {
                      throw new Error('Sila log masuk untuk mendengar audio');
                    }

                    const storage = getStorage();
                    const path = buildAudioPath(langReciter.language, langReciter.id, ayah.surahNumber, i);
                    const storageRef = ref(storage, path);
                    const ayahBlob = await getBlob(storageRef);
                    await cacheAudio(ayahCacheKey, ayahBlob);
                  }
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
          const currentMode = cur.recitationMode;
          const currentLang = activeLanguageRef.current;
          const currentAyahNum = cur.currentAyah.ayahNumberInSurah;
          const surahNum = cur.currentAyah.surahNumber;

          if (currentMode === 'arabic-then-malay') {
            if (currentLang === 'arabic') {
              // Arabic just finished -> play Malay for SAME ayah
              const malayReciter = getReciterForLanguage('malay');
              activeLanguageRef.current = 'malay';
              setState(prev => ({ ...prev, activeLanguage: 'malay' }));
              playAyahInternal(
                { surahNumber: surahNum, ayahNumberInSurah: currentAyahNum },
                true,
                cur.totalAyahsInSurah,
                malayReciter,
                currentMode
              );
              return;
            } else {
              // Malay just finished -> advance to NEXT ayah, play Arabic
              const nextAyah = currentAyahNum + 1;
              if (nextAyah <= cur.totalAyahsInSurah) {
                const arabicReciter = getReciterForLanguage('arabic');
                activeLanguageRef.current = 'arabic';
                setState(prev => ({ ...prev, activeLanguage: 'arabic' }));
                playAyahInternal(
                  { surahNumber: surahNum, ayahNumberInSurah: nextAyah },
                  true,
                  cur.totalAyahsInSurah,
                  arabicReciter,
                  currentMode
                );
                return;
              }
            }
          } else {
            // Single-language mode (arabic-only or malay-only)
            const nextAyah = currentAyahNum + 1;
            if (nextAyah <= cur.totalAyahsInSurah) {
              playAyahInternal(
                { surahNumber: surahNum, ayahNumberInSurah: nextAyah },
                true,
                cur.totalAyahsInSurah,
                cur.reciter,
                currentMode
              );
              return;
            }
          }
        }
        setState((prev) => ({
          ...prev,
          status: 'idle',
          currentAyah: null,
          surahPlayMode: false,
          activeLanguage: 'arabic',
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

  function playAyahWithReciter(surahNumber: number, ayahNumberInSurah: number, reciter: Reciter) {
    playAyahInternal(
      { surahNumber, ayahNumberInSurah },
      false,
      stateRef.current.totalAyahsInSurah,
      reciter
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
    activeLanguageRef.current = 'arabic';
    setState({ ...DEFAULT_STATE, reciter: stateRef.current.reciter });
  }

  function playEntireSurah(surahNumber: number, totalAyahs: number, mode: RecitationMode = 'arabic') {
    const initialLanguage = mode === 'malay' ? 'malay' : 'arabic';
    const reciter = getReciterForLanguage(initialLanguage);
    activeLanguageRef.current = initialLanguage;
    setState(prev => ({
      ...prev,
      reciter,
      recitationMode: mode,
      activeLanguage: initialLanguage,
    }));
    playAyahInternal(
      { surahNumber, ayahNumberInSurah: 1 },
      true,
      totalAyahs,
      reciter,
      mode
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
      value={{ ...state, playAyah, playAyahWithReciter, pause, resume, stop, playEntireSurah, setReciter, isPlayingAyah }}
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
