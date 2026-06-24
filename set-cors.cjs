const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Load service account
const serviceAccountPath = path.join(__dirname, 'service-account.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

// For firebase-admin v14+, use correct imports
const { getApps, initializeApp, cert } = admin;

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'quran-app-e5cb1.firebasestorage.app'
  });
}

const { getStorage } = require('firebase-admin/storage');

const corsConfig = [
  {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'https://quran-app-kappa-five.vercel.app'],
    method: ['GET', 'HEAD'],
    maxAgeSeconds: 3600
  }
];

async function setCors() {
  try {
    const storage = getStorage();
    const bucket = storage.bucket();
    
    console.log('Setting CORS configuration for bucket:', bucket.name);
    console.log('CORS config:', JSON.stringify(corsConfig, null, 2));
    
    await bucket.setCorsConfiguration(corsConfig);
    
    console.log('✅ CORS configuration set successfully!');
    console.log('✅ You can now access audio files from localhost');
  } catch (error) {
    console.error('❌ Error setting CORS:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

setCors();
