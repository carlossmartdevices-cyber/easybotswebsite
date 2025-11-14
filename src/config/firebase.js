/**
 * Firebase Admin SDK Configuration
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin
let db = null;

function initializeFirebase() {
  try {
    // Check if Firebase is already initialized
    if (admin.apps.length > 0) {
      db = admin.firestore();
      return { admin, db };
    }

    // Get Firebase credentials from environment
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
      ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      : null;

    if (!serviceAccount) {
      console.warn('⚠️  Firebase not configured - admin features will be limited');
      console.warn('   Set FIREBASE_SERVICE_ACCOUNT in .env to enable full functionality');
      return { admin: null, db: null };
    }

    // Initialize Firebase Admin
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL
    });

    db = admin.firestore();
    console.log('✅ Firebase initialized successfully');

    return { admin, db };
  } catch (error) {
    console.error('❌ Firebase initialization error:', error.message);
    return { admin: null, db: null };
  }
}

// Initialize on module load
const { admin: firebaseAdmin, db: firestore } = initializeFirebase();

module.exports = {
  admin: firebaseAdmin,
  db: firestore,
  initializeFirebase
};
