// Script to download Quran data from api.alquran.cloud
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://api.alquran.cloud/v1';
const DATA_DIR = path.join(__dirname, 'public', 'data');

async function download() {
  // Create data directory
  fs.mkdirSync(DATA_DIR, { recursive: true });

  // 1. Download surah list
  console.log('Downloading surah list...');
  const surahRes = await fetch(`${BASE_URL}/surah`);
  const surahJson = await surahRes.json();
  fs.writeFileSync(path.join(DATA_DIR, 'surahs.json'), JSON.stringify(surahJson.data));
  console.log(`  Saved surahs.json (${surahJson.data.length} surahs)`);

  // 2. Download each surah with 4 editions
  for (let i = 1; i <= 114; i++) {
    console.log(`Downloading surah ${i}/114...`);
    const res = await fetch(
      `${BASE_URL}/surah/${i}/editions/quran-uthmani,en.transliteration,ms.basmeih,en.sahih`
    );
    const json = await res.json();

    const data = {
      arabic: json.data[0],
      transliteration: json.data[1],
      malay: json.data[2],
      english: json.data[3],
    };

    fs.writeFileSync(path.join(DATA_DIR, `surah-${i}.json`), JSON.stringify(data));

    // Small delay to be polite to the API
    if (i % 10 === 0) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('Done! All data saved to public/data/');
}

download().catch(console.error);
