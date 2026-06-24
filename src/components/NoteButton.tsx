import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotes } from '../hooks/useNotes';

interface NoteButtonProps {
  surahNumber: number;
  ayahNumber: number;
}

export function NoteButton({ surahNumber, ayahNumber }: NoteButtonProps) {
  const { user } = useAuth();
  const { getNote, saveNote, deleteNote } = useNotes();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const existingNote = user ? getNote(surahNumber, ayahNumber) : undefined;
  const hasNote = Boolean(existingNote);

  function handleOpen() {
    setDraft(existingNote ?? '');
    setOpen(true);
  }

  async function handleSave() {
    if (!draft.trim()) return;
    setSaving(true);
    await saveNote(surahNumber, ayahNumber, draft.trim());
    setSaving(false);
    setOpen(false);
  }

  async function handleDelete() {
    setSaving(true);
    await deleteNote(surahNumber, ayahNumber);
    setSaving(false);
    setOpen(false);
  }

  if (!user) {
    return (
      <div className="group relative">
        <button
          disabled
          className="flex h-7 w-7 items-center justify-center rounded-full text-stone-300 cursor-not-allowed"
          aria-label="Log masuk untuk tambah nota"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
          Log masuk untuk nota
        </span>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className={`flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-blue-50 ${
          hasNote ? 'text-blue-500' : 'text-stone-400 hover:text-blue-400'
        }`}
        aria-label={hasNote ? 'Edit nota' : 'Tambah nota'}
      >
        <svg className="h-4 w-4" fill={hasNote ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      {open && (
        <div className="mt-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={3}
            placeholder="Tulis nota anda di sini..."
            className="w-full resize-none rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            autoFocus
          />
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving || !draft.trim()}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border border-stone-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-stone-50"
              >
                Batal
              </button>
            </div>
            {hasNote && (
              <button
                onClick={handleDelete}
                disabled={saving}
                className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                Padam
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
