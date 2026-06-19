import { Link } from 'react-router-dom';
import type { SurahInfo } from '../types/quran.ts';

export function SurahCard({ surah }: { surah: SurahInfo }) {
  return (
    <Link
      to={`/surah/${surah.number}`}
      className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md hover:bg-emerald-50/40"
    >
      {/* Surah number badge */}
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm font-bold text-amber-800">
        {surah.number}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-gray-900 truncate">{surah.englishName}</span>
          <span className="text-xs text-gray-500 truncate">{surah.englishNameTranslation}</span>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
          <span
            className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
              surah.revelationType === 'Meccan'
                ? 'bg-blue-100 text-blue-700'
                : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {surah.revelationType}
          </span>
          <span>{surah.numberOfAyahs} Ayat</span>
        </div>
      </div>

      {/* Arabic name */}
      <span className="font-arabic text-xl text-gray-800 shrink-0" dir="rtl">
        {surah.name}
      </span>
    </Link>
  );
}
