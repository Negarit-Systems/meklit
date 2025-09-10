import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const { firebaseServiceAccountPath } = config();

if (!firebaseServiceAccountPath) {
  throw new Error(
    'FIREBASE_SERVICE_ACCOUNT_PATH is not defined in environment variables',
  );
}

const serviceAccountPath = path.resolve(
  __dirname,
  '..',
  firebaseServiceAccountPath,
);

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

const db = admin.firestore();
export { db };
