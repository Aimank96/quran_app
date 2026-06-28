import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSurahDetail } from '../hooks/useSurahDetail.ts';
import { useSurahMeta } from '../hooks/useSurahMeta.ts';
import { useLang } from '../context/LangContext.tsx';
import { AyahVerse } from '../components/AyahVerse.tsx';
import { LoadingSpinner } from '../components/LoadingSpinner.tsx';
import { SurahPlayAllButton } from '../components/SurahPlayAllButton.tsx';

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const BISMILLAH_RUMI = 'Bismillaahir Rahmaanir Raheem';

export function SurahPage() {
  const { surahNumber } = useParams<{ surahNumber: string }>();
  const navigate = useNavigate();
  const { lang } = useLang();
  const num = Number(surahNumber);
  const { surahData, loading, error } = useSurahDetail(num);
  const meta = useSurahMeta(num);
  const [showInfo, setShowInfo] = useState(false);

  const isMalay = lang === 'ms';

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="py-12 text-center text-red-600">
        <p>{isMalay ? 'Gagal memuatkan surah:' : 'Failed to load surah:'} {error}</p>
        <Link to="/" className="mt-2 inline-block text-emerald-600 underline">
          {isMalay ? 'Kembali ke Senarai Surah' : 'Back to Surah List'}
        </Link>
      </div>
    );
  }

  if (!surahData) return null;

  const { arabic, transliteration, malay, english } = surahData;
  const translation = lang === 'ms' ? malay : english;
  const showBismillah = num !== 1 && num !== 9;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="mb-4 flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        {isMalay ? 'Kembali' : 'Back'}
      </button>

      {/* Surah header */}
      <div className="mb-6 text-center">
        <h1 className="font-arabic text-4xl text-gray-900 mb-2" dir="rtl">
          {arabic.name}
        </h1>
        <h2 className="text-xl font-semibold text-gray-800">{arabic.englishName}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {isMalay ? arabic.englishNameTranslation : arabic.englishNameTranslation} &bull; {arabic.numberOfAyahs} {isMalay ? 'Ayat' : 'Verses'} &bull;{' '}
          <span
            className={
              arabic.revelationType === 'Meccan' ? 'text-blue-600' : 'text-emerald-600'
            }
          >
            {isMalay
              ? (arabic.revelationType === 'Meccan' ? 'Makkah' : 'Madinah')
              : arabic.revelationType}
          </span>
        </p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <SurahPlayAllButton surahNumber={num} totalAyahs={arabic.numberOfAyahs} />
          {meta && (
            <button
              onClick={() => setShowInfo(v => !v)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                showInfo
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-white border border-stone-300 text-gray-700 hover:bg-stone-50'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showInfo
                ? (isMalay ? 'Sembunyi Info' : 'Hide Info')
                : (isMalay ? 'Tentang Surah Ini' : 'About This Surah')}
            </button>
          )}
        </div>
      </div>

      {/* Synopsis & History panel */}
      {showInfo && meta && (
        <div className="mb-8 rounded-xl border border-emerald-100 bg-emerald-50/60 p-5 animate-in fade-in">
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-800 uppercase tracking-wide mb-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              {isMalay ? 'Sinopsis' : 'Synopsis'}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {isMalay ? meta.s_ms : meta.s_en}
            </p>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-800 uppercase tracking-wide mb-2">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isMalay ? 'Sejarah & Latar Belakang' : 'History & Background'}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {isMalay ? meta.h_ms : meta.h_en}
            </p>
          </div>
        </div>
      )}

      {/* Bismillah */}
      {showBismillah && (
        <div className="text-center mb-8">
          <p className="font-arabic text-2xl text-gray-700 mb-1" dir="rtl" lang="ar">
            {BISMILLAH}
          </p>
          <p className="italic text-amber-800">{BISMILLAH_RUMI}</p>
        </div>
      )}

      {/* Ayahs */}
      <div className="divide-y-0">
        {arabic.ayahs.map((arAyah, i) => (
          <AyahVerse
            key={arAyah.number}
            arabicAyah={arAyah}
            transliterationAyah={transliteration.ayahs[i]}
            translationAyah={translation.ayahs[i]}
            surahNumber={num}
          />
        ))}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between border-t border-stone-200 pt-6">
        {num > 1 ? (
          <button
            onClick={() => navigate(`/surah/${num - 1}`)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            {isMalay ? '← Surah Sebelum' : '← Previous Surah'}
          </button>
        ) : (
          <div />
        )}
        {num < 114 ? (
          <button
            onClick={() => navigate(`/surah/${num + 1}`)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            {isMalay ? 'Surah Seterusnya →' : 'Next Surah →'}
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
