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
import { bookmarkDocId, type NoteData } from '../types/firebase';

interface UseNotesReturn {
  notes: Map<string, NoteData>;
  getNote: (surahNumber: number, ayahNumber: number) => string | undefined;
  saveNote: (surahNumber: number, ayahNumber: number, text: string) => Promise<void>;
  deleteNote: (surahNumber: number, ayahNumber: number) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useNotes(): UseNotesReturn {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Map<string, NoteData>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setNotes(new Map());
      setLoading(false);
      return;
    }

    setLoading(true);
    const colRef = collection(db, 'users', user.uid, 'notes');
    const unsubscribe: Unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const map = new Map<string, NoteData>();
        snapshot.forEach((d) => {
          map.set(d.id, d.data() as NoteData);
        });
        setNotes(map);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [user]);

  function getNote(surahNumber: number, ayahNumber: number): string | undefined {
    return notes.get(bookmarkDocId(surahNumber, ayahNumber))?.note;
  }

  async function saveNote(surahNumber: number, ayahNumber: number, text: string): Promise<void> {
    if (!user) return;
    const id = bookmarkDocId(surahNumber, ayahNumber);
    const docRef = doc(db, 'users', user.uid, 'notes', id);
    try {
      const data: Omit<NoteData, 'timestamp'> & { timestamp: ReturnType<typeof serverTimestamp> } = {
        surahNumber,
        ayahNumber,
        note: text,
        timestamp: serverTimestamp(),
      };
      await setDoc(docRef, data, { merge: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ralat nota');
    }
  }

  async function deleteNote(surahNumber: number, ayahNumber: number): Promise<void> {
    if (!user) return;
    const id = bookmarkDocId(surahNumber, ayahNumber);
    const docRef = doc(db, 'users', user.uid, 'notes', id);
    try {
      await deleteDoc(docRef);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ralat padam nota');
    }
  }

  return { notes, getNote, saveNote, deleteNote, loading, error };
}
