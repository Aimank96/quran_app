import { useAudio } from '../context/AudioContext';

interface AudioPlayButtonProps {
  surahNumber: number;
  ayahNumberInSurah: number;
}

export function AudioPlayButton({ surahNumber, ayahNumberInSurah }: AudioPlayButtonProps) {
  const { status, currentAyah, playAyah, pause, resume } = useAudio();

  const isThisAyah =
    currentAyah?.surahNumber === surahNumber &&
    currentAyah?.ayahNumberInSurah === ayahNumberInSurah;

  const isPlaying = isThisAyah && status === 'playing';
  const isLoading = isThisAyah && status === 'loading';
  const isPaused = isThisAyah && status === 'paused';
  const isActive = isThisAyah && (isPlaying || isLoading || isPaused);

  function handleClick() {
    if (isPlaying) {
      pause();
    } else if (isPaused) {
      resume();
    } else {
      playAyah(surahNumber, ayahNumberInSurah);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
        isActive
          ? 'bg-emerald-600 text-white hover:bg-emerald-700'
          : 'text-stone-400 hover:bg-emerald-50 hover:text-emerald-600'
      }`}
      aria-label={isPlaying ? 'Jeda' : 'Main'}
    >
      {isLoading ? (
        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
      ) : isPlaying ? (
        // Pause icon
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        // Play icon
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7L8 5z" />
        </svg>
      )}
    </button>
  );
}
