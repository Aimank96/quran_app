import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSurahDetail } from '../hooks/useSurahDetail.ts';
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

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="py-12 text-center text-red-600">
        <p>Gagal memuatkan surah: {error}</p>
        <Link to="/" className="mt-2 inline-block text-emerald-600 underline">
          Kembali ke Senarai Surah
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
      {/* Surah header */}
      <div className="mb-8 text-center">
        <h1 className="font-arabic text-4xl text-gray-900 mb-2" dir="rtl">
          {arabic.name}
        </h1>
        <h2 className="text-xl font-semibold text-gray-800">{arabic.englishName}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {arabic.englishNameTranslation} &bull; {arabic.numberOfAyahs} Ayat &bull;{' '}
          <span
            className={
              arabic.revelationType === 'Meccan' ? 'text-blue-600' : 'text-emerald-600'
            }
          >
            {arabic.revelationType}
          </span>
        </p>
        <div className="mt-4">
          <SurahPlayAllButton surahNumber={num} totalAyahs={arabic.numberOfAyahs} />
        </div>
      </div>

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
            ← Surah Sebelum
          </button>
        ) : (
          <div />
        )}
        {num < 114 ? (
          <button
            onClick={() => navigate(`/surah/${num + 1}`)}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Surah Seterusnya →
          </button>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
