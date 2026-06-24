import { useAudio } from '../context/AudioContext';
import { ReciterSelector } from './ReciterSelector';

export function AudioPlayerBar() {
  const { status, currentAyah, surahPlayMode, pause, resume, stop } = useAudio();

  if (status === 'idle') return null;

  const isPlaying = status === 'playing';
  const isLoading = status === 'loading';
  const isError = status === 'error';

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-stone-200 bg-white/95 shadow-lg backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        {/* Current ayah info */}
        <div className="flex-1 min-w-0">
          {currentAyah && !isError && (
            <p className="text-sm font-medium text-gray-800 truncate">
              Surah {currentAyah.surahNumber} &bull; Ayat {currentAyah.ayahNumberInSurah}
              {surahPlayMode && (
                <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                  Keseluruhan
                </span>
              )}
            </p>
          )}
          {isError && (
            <p className="text-sm text-red-600">Audio tidak dapat dimuat. Periksa sambungan internet.</p>
          )}
          <div className="mt-0.5">
            <ReciterSelector />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Loading spinner */}
          {isLoading && (
            <svg className="h-5 w-5 animate-spin text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}

          {/* Play/Pause */}
          {!isLoading && !isError && (
            <button
              onClick={isPlaying ? pause : resume}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
              aria-label={isPlaying ? 'Jeda' : 'Teruskan'}
            >
              {isPlaying ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              )}
            </button>
          )}

          {/* Stop */}
          <button
            onClick={stop}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-gray-600 transition hover:bg-stone-100"
            aria-label="Henti"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
