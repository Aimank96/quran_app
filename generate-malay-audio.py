#!/usr/bin/env python3
"""
generate-malay-audio.py

Generates Malay Quran audio using pyttsx3 (free, offline)
Uploads generated MP3s to Firebase Storage
Fully resumable - skips already uploaded files
"""

import json
import os
import sys
import time
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import requests
import firebase_admin
from firebase_admin import credentials, storage
import pyttsx3

# ─── Configuration ───────────────────────────────────────────────────────────

RECITER_ID = 'pyttsx3'
LANGUAGE = 'malay'
PROJECT_ID = 'quran-app-e5cb1'
BUCKET = f'{PROJECT_ID}.firebasestorage.app'
TTS_RATE = 100  # Words per minute (slower = clearer for recitation)
TTS_VOLUME = 0.9

CONCURRENCY = 2
BATCH_DELAY_MS = 500

# ─── Load Malay data ─────────────────────────────────────────────────────────

def load_malay_ayahs():
    """Load Malay translations from surah JSON files"""
    ayahs = []
    data_dir = Path('public/data')
    
    for surah in range(1, 115):
        try:
            file_path = data_dir / f'surah-{surah}.json'
            with open(file_path, 'r', encoding='utf-8') as f:
                content = json.load(f)
            
            if 'malay' in content and 'ayahs' in content['malay']:
                for ayah in content['malay']['ayahs']:
                    ayahs.append({
                        'surah': surah,
                        'ayah': ayah['numberInSurah'],
                        'text': ayah['text'],
                    })
        except Exception as e:
            print(f'⚠️  Could not load surah {surah}: {e}')
    
    return ayahs

# ─── Helpers ─────────────────────────────────────────────────────────────────

def pad(n):
    return str(n).zfill(3)

def filename(surah, ayah):
    return f'{pad(surah)}{pad(ayah)}.mp3'

def storage_path(surah, ayah):
    return f'audio/{LANGUAGE}/{RECITER_ID}/{filename(surah, ayah)}'

def generate_speech(text):
    """Generate speech using pyttsx3 and save to MP3"""
    try:
        engine = pyttsx3.init()
        engine.setProperty('rate', TTS_RATE)
        engine.setProperty('volume', TTS_VOLUME)
        
        # Try to set Malay language
        try:
            engine.setProperty('voice', 'malay')
        except:
            pass  # Use default voice if Malay not available
        
        temp_file = 'temp_audio.mp3'
        engine.save_to_file(text, temp_file)
        engine.runAndWait()
        
        if os.path.exists(temp_file):
            with open(temp_file, 'rb') as f:
                data = f.read()
            os.remove(temp_file)
            return data
        return None
    except Exception as e:
        print(f'❌ Generation error: {e}')
        return None

def file_exists_in_storage(blob):
    """Check if blob exists in Firebase Storage"""
    try:
        blob.reload()
        return True
    except Exception:
        return False

def process_ayah(surah, ayah, text, index, total, bucket):
    """Generate speech, upload to Firebase"""
    fname = filename(surah, ayah)
    path = storage_path(surah, ayah)
    
    try:
        # Get blob reference
        blob = bucket.blob(path)
        
        # Check if already exists
        if file_exists_in_storage(blob):
            print(f'  ⏭  [{index}/{total}] {fname} — exists')
            return 'skipped'
        
        # Generate speech
        sys.stdout.write(f'  🎙️  [{index}/{total}] {fname} — generating...\r')
        sys.stdout.flush()
        audio_data = generate_speech(text)
        
        if not audio_data:
            print(f'  ❌ [{index}/{total}] {fname} — generation failed')
            return 'error'
        
        # Upload
        blob.upload_from_string(audio_data, content_type='audio/mpeg')
        size_kb = len(audio_data) / 1024
        print(f'  ✅ [{index}/{total}] {fname} ({size_kb:.0f} KB)')
        return 'uploaded'
    except Exception as e:
        print(f'  ❌ [{index}/{total}] {fname} — {str(e)[:50]}')
        return 'error'

async def main():
    print('\n🕌  Malay Quran Audio Generator (pyttsx3)')
    print(f'   Reciter  : {RECITER_ID}')
    print(f'   Language : {LANGUAGE}')
    print('   Loading Malay translations...\n')
    
    ayahs = load_malay_ayahs()
    TOTAL = len(ayahs)
    print(f'   ✅ Loaded {TOTAL} ayahs')
    
    # Initialize Firebase
    print('   Initializing Firebase...')
    try:
        firebase_admin.get_app()
    except ValueError:
        # App not initialized, initialize it
        cred = credentials.Certificate('service-account.json')
        firebase_admin.initialize_app(cred, {
            'storageBucket': BUCKET
        })
    
    bucket = storage.bucket()
    print('   ✅ Firebase connected\n')
    print('   Generating and uploading Malay audio...\n')
    
    start_time = time.time()
    uploaded, skipped, errors = 0, 0, 0
    
    for i, ayah_data in enumerate(ayahs, 1):
        result = process_ayah(
            ayah_data['surah'],
            ayah_data['ayah'],
            ayah_data['text'],
            i,
            TOTAL,
            bucket
        )
        
        if result == 'uploaded':
            uploaded += 1
        elif result == 'skipped':
            skipped += 1
        else:
            errors += 1
        
        # Show progress every 50 files
        if i % 50 == 0:
            pct = (i / TOTAL) * 100
            print(f'   Progress: {pct:.1f}% ({uploaded} uploaded, {skipped} skipped, {errors} errors)')
        
        if i < TOTAL:
            time.sleep(BATCH_DELAY_MS / 1000)
    
    elapsed = (time.time() - start_time) / 60
    
    print('\n─────────────────────────────────')
    print(f'✅ Generated : {uploaded}')
    print(f'⏭  Skipped   : {skipped}')
    print(f'❌ Errors    : {errors}')
    print(f'⏱  Time      : {elapsed:.1f} minutes')
    print('─────────────────────────────────\n')
    
    if errors > 0:
        print('⚠️  Some files failed. Re-run to retry failed uploads.\n')
    
    sys.exit(1 if errors > 0 else 0)

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())
