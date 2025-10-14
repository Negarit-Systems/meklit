import admin from 'firebase-admin';
import { config } from './config.js';

const { firebaseServiceAccountJson } = config();

// Throw if JSON is not defined
if (!firebaseServiceAccountJson) {
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_JSON is not defined in environment variables'
  );
}

// Parse the JSON from environment variable
const serviceAccount = JSON.parse(firebaseServiceAccountJson);

// Conditionally configure Firestore emulator for development
if (process.env.NODE_ENV === 'development') {
  process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
  console.log('Using Firestore emulator at localhost:8080');
}

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
export { db };
