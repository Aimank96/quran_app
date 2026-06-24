import { useAudio } from '../context/AudioContext';

interface SurahPlayAllButtonProps {
  surahNumber: number;
  totalAyahs: number;
}

export function SurahPlayAllButton({ surahNumber, totalAyahs }: SurahPlayAllButtonProps) {
  const { status, currentAyah, surahPlayMode, playEntireSurah, stop } = useAudio();

  const isThisSurahPlaying =
    surahPlayMode &&
    currentAyah?.surahNumber === surahNumber &&
    (status === 'playing' || status === 'loading');

  function handleClick() {
    if (isThisSurahPlaying) {
      stop();
    } else {
      playEntireSurah(surahNumber, totalAyahs);
    }
  }

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
        isThisSurahPlaying
          ? 'bg-red-100 text-red-700 hover:bg-red-200'
          : 'bg-emerald-600 text-white hover:bg-emerald-700'
      }`}
    >
      {isThisSurahPlaying ? (
        <>
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" />
          </svg>
          Henti
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7L8 5z" />
          </svg>
          Main Keseluruhan Surah
        </>
      )}
    </button>
  );
}
