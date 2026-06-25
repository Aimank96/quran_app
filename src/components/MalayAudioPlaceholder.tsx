import { useAudio } from '../context/AudioContext';
import { useAuth } from '../hooks/useAuth';
import { RECITERS } from '../types/audio';

interface MalayAudioPlaceholderProps {
  surahNumber: number;
  ayahNumberInSurah: number;
}

export function MalayAudioPlaceholder({ surahNumber, ayahNumberInSurah }: MalayAudioPlaceholderProps) {
  const { status, currentAyah, playAyahWithReciter, pause, resume, reciter } = useAudio();
  const { user } = useAuth();

  const malayReciter = RECITERS.find(r => r.language === 'malay')!;
  const isThisAyahMalay =
    currentAyah?.surahNumber === surahNumber &&
    currentAyah?.ayahNumberInSurah === ayahNumberInSurah &&
    reciter.language === 'malay';

  const isPlaying = isThisAyahMalay && status === 'playing';
  const isLoading = isThisAyahMalay && status === 'loading';
  const isPaused = isThisAyahMalay && status === 'paused';
  const isActive = isThisAyahMalay && (isPlaying || isLoading || isPaused);

  function handleClick() {
    if (!user) {
      alert('Sila log masuk untuk mendengar audio');
      return;
    }

    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      // Play Malay audio without changing global reciter
      playAyahWithReciter(surahNumber, ayahNumberInSurah, malayReciter);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={!user}
      className={`flex h-7 items-center gap-1 rounded-full px-2 transition ${
        !user
          ? 'text-gray-300 cursor-not-allowed'
          : isActive
          ? 'bg-blue-600 text-white hover:bg-blue-700'
          : 'text-blue-400 hover:bg-blue-50 hover:text-blue-600'
      }`}
      aria-label={isPlaying ? 'Jeda' : 'Main BM'}
    >
      {isLoading ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : isPlaying ? (
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M12 6v12m0 0l-3-3m3 3l3-3M9 10l-1.5-1.5M6.343 6.343A8 8 0 1117.657 17.657" />
          </svg>
          <span className="text-xs font-medium">BM</span>
        </>
      )}
    </button>
  );
}
