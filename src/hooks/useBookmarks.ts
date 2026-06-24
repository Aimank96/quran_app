import { useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { bookmarkDocId, type BookmarkData } from '../types/firebase';

interface UseBookmarksReturn {
  bookmarks: Map<string, BookmarkData>;
  isBookmarked: (surahNumber: number, ayahNumber: number) => boolean;
  toggleBookmark: (surahNumber: number, ayahNumber: number, arabicText: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useBookmarks(): UseBookmarksReturn {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<Map<string, BookmarkData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setBookmarks(new Map());
      setLoading(false);
      return;
    }

    setLoading(true);
    const colRef = collection(db, 'users', user.uid, 'bookmarks');
    const unsubscribe: Unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const map = new Map<string, BookmarkData>();
        snapshot.forEach((d) => {
          map.set(d.id, d.data() as BookmarkData);
        });
        setBookmarks(map);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  function isBookmarked(surahNumber: number, ayahNumber: number): boolean {
    return bookmarks.has(bookmarkDocId(surahNumber, ayahNumber));
  }

  async function toggleBookmark(
    surahNumber: number,
    ayahNumber: number,
    arabicText: string
  ): Promise<void> {
    if (!user) return;
    const id = bookmarkDocId(surahNumber, ayahNumber);
    const docRef = doc(db, 'users', user.uid, 'bookmarks', id);
    try {
      if (bookmarks.has(id)) {
        await deleteDoc(docRef);
      } else {
        const data: Omit<BookmarkData, 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> } = {
          surahNumber,
          ayahNumber,
          arabicText,
          timestamp: serverTimestamp(),
        };
        await setDoc(docRef, data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ralat penanda');
    }
  }

  return { bookmarks, isBookmarked, toggleBookmark, loading, error };
}
