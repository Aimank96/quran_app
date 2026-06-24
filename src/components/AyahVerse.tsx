import type { Ayah } from '../types/quran.ts';
import { BookmarkButton } from './BookmarkButton.tsx';
import { NoteButton } from './NoteButton.tsx';
import { AudioPlayButton } from './AudioPlayButton.tsx';
import { MalayAudioPlaceholder } from './MalayAudioPlaceholder.tsx';

interface AyahVerseProps {
  arabicAyah: Ayah;
  transliterationAyah: Ayah;
  translationAyah: Ayah;
  surahNumber: number;
}

export function AyahVerse({ arabicAyah, transliterationAyah, translationAyah, surahNumber }: AyahVerseProps) {
  return (
    <div className="border-b border-stone-200 py-6 last:border-b-0">
      {/* Ayah number badge + action buttons */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 shrink-0">
          {arabicAyah.numberInSurah}
        </span>
        <div className="flex items-center gap-1">
          <AudioPlayButton
            surahNumber={surahNumber}
            ayahNumberInSurah={arabicAyah.numberInSurah}
          />
          <MalayAudioPlaceholder />
          <BookmarkButton
            surahNumber={surahNumber}
            ayahNumber={arabicAyah.numberInSurah}
            arabicText={arabicAyah.text}
          />
          <NoteButton
            surahNumber={surahNumber}
            ayahNumber={arabicAyah.numberInSurah}
          />
        </div>
      </div>

      {/* Arabic text */}
      <p
        className="font-arabic text-2xl leading-loose text-gray-800 text-right mb-3"
        dir="rtl"
        lang="ar"
      >
        {arabicAyah.text}
      </p>

      {/* Transliteration (Rumi) */}
      <p className="text-base italic text-amber-800 mb-3 leading-relaxed">
        {transliterationAyah.text}
      </p>

      {/* Translation */}
      <p className="text-base leading-relaxed text-gray-600">
        {translationAyah.text}
      </p>
    </div>
  );
}