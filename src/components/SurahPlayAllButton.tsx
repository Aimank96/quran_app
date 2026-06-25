import { useState } from 'react';
import { useAudio } from '../context/AudioContext';
import { useAuth } from '../hooks/useAuth';
import { RecitationModeSelector } from './RecitationModeSelector';
import type { RecitationMode } from '../types/audio';

interface SurahPlayAllButtonProps {
  surahNumber: number;
  totalAyahs: number;
}

export function SurahPlayAllButton({ surahNumber, totalAyahs }: SurahPlayAllButtonProps) {
  const { status, currentAyah, surahPlayMode, playEntireSurah, stop } = useAudio();
  const { user } = useAuth();
  const [showModeSelector, setShowModeSelector] = useState(false);

  const isThisSurahPlaying =
    surahPlayMode &&
    currentAyah?.surahNumber === surahNumber &&
    (status === 'playing' || status === 'loading');

  function handleClick() {
    if (!user) {
      alert('Sila log masuk untuk mendengar audio');
      return;
    }
    
    if (isThisSurahPlaying) {
      stop();
    } else {
      setShowModeSelector(true);
    }
  }

  function handleModeSelect(mode: RecitationMode) {
    setShowModeSelector(false);
    playEntireSurah(surahNumber, totalAyahs, mode);
  }

  return (
    <>
      <button
        onClick={handleClick}
        disabled={!user}
        className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
          !user
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : isThisSurahPlaying
            ? 'bg-red-100 text-red-700 hover:bg-red-200'
            : 'bg-emerald-600 text-white hover:bg-emerald-700'
        }`}
      >
        {!user ? (
          <>
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
            </svg>
            Log masuk untuk dengar
          </>
        ) : isThisSurahPlaying ? (
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
      <RecitationModeSelector
        isOpen={showModeSelector}
        onClose={() => setShowModeSelector(false)}
        onSelect={handleModeSelect}
      />
    </>
  );
}
