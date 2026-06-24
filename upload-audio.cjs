/**
 * upload-audio.cjs
 * 
 * Downloads ayah MP3s from everyayah.com and uploads to Firebase Storage.
 * Checks for existing files first - only uploads missing ones.
 * Fully resumable - can be stopped and restarted safely.
 */

'use strict';

const https = require('https');
const path = require('path');
const fs = require('fs');

// ─── Configuration ───────────────────────────────────────────────────────────

const RECITER_ID = 'Alafasy_128kbps';
const LANGUAGE   = 'arabic';
const PROJECT_ID = 'quran-app-e5cb1';
const BUCKET     = `${PROJECT_ID}.firebasestorage.app`;
const SOURCE_URL = `https://everyayah.com/data/${RECITER_ID}`;

const CONCURRENCY = 2;
const BATCH_DELAY_MS = 1000;

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

// ─── Surah/Ayah data ─────────────────────────────────────────────────────────

// Load ayah counts from surahs.json (accurate source)
const SURAH_DATA = JSON.parse(fs.readFileSync(path.join(__dirname, 'public/data/surahs.json'), 'utf8'));
const ALL_AYAHS = [];

SURAH_DATA.forEach((surah) => {
  for (let ayah = 1; ayah <= surah.numberOfAyahs; ayah++) {
    ALL_AYAHS.push({ surah: surah.number, ayah });
  }
});

const TOTAL = ALL_AYAHS.length;
console.log(`📊 Loaded ${TOTAL} ayahs from surahs.json`);

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

function sourceUrl(surah, ayah) {
  return `${SOURCE_URL}/${filename(surah, ayah)}`;
}

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject).setTimeout(10000, function() { this.destroy(); reject(new Error('timeout')); });
  });
}

/**
 * Check multiple files exist in Firebase Storage using REST API
 * Returns Map of path -> exists (true/false)
 */
async function checkMultipleFiles(paths, token) {
  const results = new Map();
  
  // Check 10 files at a time
  const batchSize = 10;
  let checked = 0;
  
  for (let i = 0; i < paths.length; i += batchSize) {
    const batch = paths.slice(i, i + batchSize);
    const promises = batch.map(async (path) => {
      return new Promise((resolve) => {
        const url = `https://storage.googleapis.com/storage/v1/b/${BUCKET}/o/${encodeURIComponent(path)}?access_token=${token}`;
        https.get(url, (res) => {
          results.set(path, res.statusCode === 200);
          res.on('data', () => {});
          resolve();
        }).on('error', () => {
          results.set(path, false);
          resolve();
        });
      });
    });
    await Promise.all(promises);
    
    checked += batch.length;
    // Show progress every 100 files
    if (checked % 100 === 0 || checked === paths.length) {
      const pct = ((checked / paths.length) * 100).toFixed(1);
      const existingCount = Array.from(results.values()).filter(Boolean).length;
      process.stdout.write(`🔍 Checking... ${pct}% (${checked}/${paths.length}) - Found ${existingCount} existing\r`);
    }
  }
  
  console.log(''); // New line after progress
  return results;
}

function uploadToFirebase(buffer, path, token) {
  return new Promise((resolve, reject) => {
    // Correct Firebase Storage upload endpoint
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
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 100)}` ));
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

async function processAyah(surah, ayah, index, total, token) {
  const path = storagePath(surah, ayah);
  const url = sourceUrl(surah, ayah);
  const fname = filename(surah, ayah);

  try {
    console.log(`⬇️  [${index}/${total}] ${fname} - DOWNLOADING...`);
    const buffer = await downloadBuffer(url);

    console.log(`⬆️  UPLOADING... (${(buffer.length / 1024).toFixed(0)} KB)`);
    await uploadToFirebase(buffer, path, token);
    console.log(`✅ [${index}/${total}] ${fname} - UPLOADED`);
    return 'uploaded';
  } catch (err) {
    console.log(`❌ [${index}/${total}] ${fname} - ERROR: ${err.message}`);
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

    // Show progress every 100 files with skip count
    if ((i + concurrency) % 100 === 0) {
      const pct = (((i + concurrency) / TOTAL) * 100).toFixed(1);
      console.log(`📊 Progress: ${pct}% | Uploaded: ${uploaded} | Skipped: ${skipped} | Errors: ${errors}`);
    }

    if (i + concurrency < tasks.length) {
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }

  return { uploaded, skipped, errors };
}

async function main() {
  console.log('\n🕌  Quran Audio Uploader (Resumable)');
  console.log(`   Reciter  : ${RECITER_ID}`);
  console.log(`   Language : ${LANGUAGE}`);
  console.log(`   Total    : ${TOTAL} ayahs`);
  console.log(`   Bucket   : ${BUCKET}\n`);
  console.log('   Getting access token...');

  let token;
  try {
    token = await getAccessToken();
    console.log('   ✅ Token acquired\n');
  } catch (err) {
    console.error('   ❌ Failed to get token:', err.message);
    process.exit(1);
  }

  // Check all files in batches
  console.log('🔍 Checking which files already exist...');
  const allPaths = ALL_AYAHS.map(({ surah, ayah }) => storagePath(surah, ayah));
  const existenceMap = await checkMultipleFiles(allPaths, token);
  
  const existingCount = Array.from(existenceMap.values()).filter(Boolean).length;
  const missingCount = TOTAL - existingCount;
  console.log(`✅ Found ${existingCount} existing files, ${missingCount} need uploading\n`);

  // Only process missing files
  const missingAyahs = ALL_AYAHS.filter(({ surah, ayah }, i) => {
    return !existenceMap.get(storagePath(surah, ayah));
  });

  if (missingAyahs.length === 0) {
    console.log('🎉 All files already uploaded! Nothing to do.');
    process.exit(0);
  }

  console.log(`📦 Uploading ${missingAyahs.length} files...\n`);

  const tasks = missingAyahs.map(({ surah, ayah }, i) => {
    return () => processAyah(surah, ayah, i + 1, missingAyahs.length, token);
  });

  const start = Date.now();
  const { uploaded, skipped, errors } = await runInBatches(tasks, CONCURRENCY, BATCH_DELAY_MS);
  const elapsed = ((Date.now() - start) / 1000 / 60).toFixed(1);

  console.log('\n─────────────────────────────────');
  console.log(`✅ Uploaded : ${uploaded}`);
  console.log(`⏭  Skipped  : ${skipped}`);
  console.log(`❌ Errors   : ${errors}`);
  console.log(`⏱  Time     : ${elapsed} minutes`);
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
