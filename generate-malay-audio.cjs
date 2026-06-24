/**
 * generate-malay-audio.cjs
 * 
 * Generates Malay Quran audio using Microsoft Edge TTS API (free, no auth needed)
 * Downloads Malay translations from local JSON files
 * Uploads generated MP3s to Firebase Storage
 * Fully resumable - skips already uploaded files
 */

'use strict';

const https = require('https');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// ─── Configuration ───────────────────────────────────────────────────────────

const RECITER_ID = 'EdgeTTS';
const LANGUAGE   = 'malay';
const PROJECT_ID = 'quran-app-e5cb1';
const BUCKET     = `${PROJECT_ID}.firebasestorage.app`;
const TTS_VOICE  = 'ms-MY-YusofNeural'; // Malay male voice

const CONCURRENCY = 1; // Microsoft Edge TTS API has rate limits
const BATCH_DELAY_MS = 500;

// ─── Load service account ────────────────────────────────────────────────────

const serviceAccountPath = path.join(__dirname, 'service-account.json');
let serviceAccount;
try {
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
} catch (err) {
  console.error('\n❌ service-account.json not found or invalid!');
  process.exit(1);
}

// ─── Get OAuth token ────────────────────────────────────────────────────────

async function getAccessToken() {
  const { private_key, client_email } = serviceAccount;
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64').replace(/[=+/]/g, (c) => ({ '=': '', '+': '-', '/': '_' }[c]));
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({
    iss: client_email,
    scope: 'https://www.googleapis.com/auth/devstorage.full_control',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  })).toString('base64').replace(/[=+/]/g, (c) => ({ '=': '', '+': '-', '/': '_' }[c]));

  const crypto = require('crypto');
  const signature = crypto.createSign('RSA-SHA256').update(`${header}.${payload}`).sign(private_key, 'base64')
    .replace(/[=+/]/g, (c) => ({ '=': '', '+': '-', '/': '_' }[c]));

  const jwt = `${header}.${payload}.${signature}`;

  return new Promise((resolve, reject) => {
    const postData = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': postData.length },
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        try {
          const { access_token } = JSON.parse(data);
          resolve(access_token);
        } catch (e) {
          reject(new Error(`Token error: ${data.substring(0, 100)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// ─── Load Malay data from JSON ───────────────────────────────────────────────

function loadMalayAyahs() {
  const ayahs = [];
  const dataDir = path.join(__dirname, 'public/data');

  for (let surah = 1; surah <= 114; surah++) {
    try {
      const filePath = path.join(dataDir, `surah-${surah}.json`);
      const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (content.malay && content.malay.ayahs) {
        content.malay.ayahs.forEach((ayah) => {
          ayahs.push({
            surah,
            ayah: ayah.numberInSurah,
            text: ayah.text,
          });
        });
      }
    } catch (err) {
      console.warn(`⚠️  Could not load surah ${surah}:`, err.message);
    }
  }

  return ayahs;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(n) {
  return String(n).padStart(3, '0');
}

function filename(surah, ayah) {
  return `${pad(surah)}${pad(ayah)}.mp3`;
}

function storagePath(surah, ayah) {
  return `audio/${LANGUAGE}/${RECITER_ID}/${filename(surah, ayah)}`;
}

/**
 * Generate speech using Microsoft Edge TTS API (free, no auth)
 * Returns buffer or null on error
 */
function generateSpeech(text) {
  return new Promise((resolve) => {
    const ssml = `<speak version='1.0' xml:lang='ms-MY'>
      <voice name='${TTS_VOICE}'>
        ${escapeXml(text)}
      </voice>
    </speak>`;

    const postData = ssml;

    const options = {
      hostname: 'tts.speech.microsoft.com',
      port: 443,
      path: '/cognitiveservices/v1',
      method: 'POST',
      headers: {
        'X-Microsoft-OutputFormat': 'audio-16khz-32kbitrate-mono-mp3',
        'Content-Type': 'application/ssml+xml',
        'Content-Length': Buffer.byteLength(postData),
      },
      timeout: 30000,
    };

    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve(Buffer.concat(chunks));
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    req.write(postData);
    req.end();
  });
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Check if file exists in Firebase Storage
 */
function fileExists(path, token) {
  return new Promise((resolve) => {
    const url = `https://firebasestorage.googleapis.com/storage/v1/b/${BUCKET}/o/${encodeURIComponent(path)}?access_token=${token}`;
    https.get(url, (res) => {
      resolve(res.statusCode === 200);
      res.on('data', () => {});
    }).on('error', () => resolve(false));
  });
}

/**
 * Upload to Firebase Storage
 */
function uploadToFirebase(buffer, path, token) {
  return new Promise((resolve, reject) => {
    const url = `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET}/o?uploadType=media&name=${encodeURIComponent(path)}&access_token=${token}`;
    
    const req = https.request(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'audio/mpeg', 
        'Content-Length': buffer.length 
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => data += c);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
          resolve();
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });
    
    req.on('error', reject);
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Upload timeout'));
    });
    req.write(buffer);
    req.end();
  });
}

async function processAyah(surah, ayah, text, index, total, token) {
  const path = storagePath(surah, ayah);
  const fname = filename(surah, ayah);

  try {
    // Check if already exists
    const exists = await fileExists(path, token);
    if (exists) {
      process.stdout.write(`  ⏭  [${index}/${total}] ${fname} — exists\r`);
      return 'skipped';
    }

    // Generate speech using Edge TTS (free API)
    process.stdout.write(`  🎙️  [${index}/${total}] ${fname} — generating...\r`);
    const buffer = await generateSpeech(text);
    
    if (!buffer) {
      process.stdout.write(`  ❌ [${index}/${total}] ${fname} — generation failed\n`);
      return 'error';
    }

    // Upload
    await uploadToFirebase(buffer, path, token);
    process.stdout.write(`  ✅ [${index}/${total}] ${fname} (${(buffer.length / 1024).toFixed(0)} KB)\n`);
    return 'uploaded';
  } catch (err) {
    process.stdout.write(`  ❌ [${index}/${total}] ${fname} — ${err.message}\n`);
    return 'error';
  }
}

async function runInBatches(tasks, concurrency, delayMs) {
  let uploaded = 0, skipped = 0, errors = 0;
  
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const results = await Promise.all(batch.map((t) => t()));
    
    results.forEach((r) => {
      if (r === 'uploaded') uploaded++;
      else if (r === 'skipped') skipped++;
      else errors++;
    });

    // Show progress every 50 files
    if ((i + concurrency) % 50 === 0) {
      const pct = (((i + concurrency) / tasks.length) * 100).toFixed(1);
      console.log(`   Progress: ${pct}% (${uploaded} uploaded, ${skipped} skipped, ${errors} errors)`);
    }

    if (i + concurrency < tasks.length) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  return { uploaded, skipped, errors };
}

async function main() {
  console.log('\n🕌  Malay Quran Audio Generator (Edge TTS)');
  console.log(`   Reciter  : ${RECITER_ID}`);
  console.log(`   Language : ${LANGUAGE}`);
  console.log(`   Voice    : ${TTS_VOICE}`);
  console.log('   Loading Malay translations...\n');

  const ayahs = loadMalayAyahs();
  const TOTAL = ayahs.length;

  console.log(`   ✅ Loaded ${TOTAL} ayahs`);
  console.log('   Getting access token...');

  let token;
  try {
    token = await getAccessToken();
    console.log('   ✅ Token acquired\n');
  } catch (err) {
    console.error('   ❌ Failed to get token:', err.message);
    process.exit(1);
  }

  console.log('   Generating and uploading Malay audio...\n');

  const tasks = ayahs.map(({ surah, ayah, text }, i) => {
    return () => processAyah(surah, ayah, text, i + 1, TOTAL, token);
  });

  const start = Date.now();
  const { uploaded, skipped, errors } = await runInBatches(tasks, CONCURRENCY, BATCH_DELAY_MS);
  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);

  console.log('\n─────────────────────────────────');
  console.log(`✅ Generated : ${uploaded}`);
  console.log(`⏭  Skipped   : ${skipped}`);
  console.log(`❌ Errors    : ${errors}`);
  console.log(`⏱  Time      : ${elapsed} minutes`);
  console.log('─────────────────────────────────\n');

  if (errors > 0) {
    console.log('⚠️  Some files failed. Re-run to retry failed uploads.\n');
  }

  process.exit(errors > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('\n💥 Fatal error:', err.message);
  process.exit(1);
});
