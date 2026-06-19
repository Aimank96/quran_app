// Build search index from downloaded surah data
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'public', 'data');

function buildIndex() {
  const surahsInfo = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'surahs.json'), 'utf-8'));
  const msIndex = [];
  const enIndex = [];

  for (let i = 1; i <= 114; i++) {
    const data = JSON.parse(fs.readFileSync(path.join(DATA_DIR, `surah-${i}.json`), 'utf-8'));
    const surahInfo = surahsInfo.find(s => s.number === i);

    data.malay.ayahs.forEach((ayah, idx) => {
      msIndex.push({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        surah: {
          number: i,
          name: surahInfo.name,
          englishName: surahInfo.englishName,
          englishNameTranslation: surahInfo.englishNameTranslation,
          numberOfAyahs: surahInfo.numberOfAyahs,
          revelationType: surahInfo.revelationType,
        },
      });
    });

    data.english.ayahs.forEach((ayah, idx) => {
      enIndex.push({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        surah: {
          number: i,
          name: surahInfo.name,
          englishName: surahInfo.englishName,
          englishNameTranslation: surahInfo.englishNameTranslation,
          numberOfAyahs: surahInfo.numberOfAyahs,
          revelationType: surahInfo.revelationType,
        },
      });
    });
  }

  fs.writeFileSync(path.join(DATA_DIR, 'search-ms.json'), JSON.stringify(msIndex));
  fs.writeFileSync(path.join(DATA_DIR, 'search-en.json'), JSON.stringify(enIndex));
  console.log(`Search index built: ${msIndex.length} Malay ayahs, ${enIndex.length} English ayahs`);
}

buildIndex();
