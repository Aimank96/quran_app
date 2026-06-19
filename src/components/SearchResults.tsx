import { Link } from 'react-router-dom';
import type { SearchMatch } from '../types/quran.ts';

function highlightText(text: string, keyword: string) {
  if (!keyword.trim()) return text;
  const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark key={i} className="bg-yellow-200 text-gray-900 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export function SearchResults({
  matches,
  keyword,
}: {
  matches: SearchMatch[];
  keyword: string;
}) {
  if (matches.length === 0) {
    return (
      <p className="py-8 text-center text-gray-500">
        Tiada hasil dijumpai untuk "{keyword}".
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {matches.map((match) => (
        <Link
          key={match.number}
          to={`/surah/${match.surah.number}#ayah-${match.numberInSurah}`}
          className="block rounded-lg bg-white p-4 shadow-sm transition hover:shadow-md hover:bg-emerald-50/40"
        >
          <div className="mb-1 flex items-center gap-2 text-sm text-emerald-700 font-medium">
            <span>{match.surah.englishName}</span>
            <span className="text-gray-400">•</span>
            <span>Ayat {match.numberInSurah}</span>
          </div>
          <p className="text-gray-700 leading-relaxed">
            {highlightText(match.text, keyword)}
          </p>
        </Link>
      ))}
    </div>
  );
}
