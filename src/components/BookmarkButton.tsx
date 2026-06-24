import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../hooks/useBookmarks';

interface BookmarkButtonProps {
  surahNumber: number;
  ayahNumber: number;
  arabicText: string;
}

export function BookmarkButton({ surahNumber, ayahNumber, arabicText }: BookmarkButtonProps) {
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const bookmarked = user ? isBookmarked(surahNumber, ayahNumber) : false;

  if (!user) {
    return (
      <div className="group relative">
        <button
          disabled
          className="flex h-7 w-7 items-center justify-center rounded-full text-stone-300 cursor-not-allowed"
          aria-label="Log masuk untuk menandai"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3-7 3V5z" />
          </svg>
        </button>
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
          Log masuk untuk menandai
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={() => toggleBookmark(surahNumber, ayahNumber, arabicText)}
      className={`flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-amber-50 ${
        bookmarked ? 'text-amber-500' : 'text-stone-400 hover:text-amber-400'
      }`}
      aria-label={bookmarked ? 'Buang penanda' : 'Tambah penanda'}
    >
      <svg className="h-4 w-4" fill={bookmarked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3-7 3V5z" />
      </svg>
    </button>
  );
}
