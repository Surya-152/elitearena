// src/config/firebase.js — Firebase v10 optimized config
import { initializeApp }     from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  initializeFirestore,
  connectFirestoreEmulator,
  persistentLocalCache,
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED,
} from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || '',
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID|| '',
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
};

// Boot-time config validation
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.warn(
    '[EliteArena] Firebase config missing. Copy .env.example → .env and fill all VITE_FIREBASE_* values.'
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

// Firestore with unlimited offline cache + multi-tab sync
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager:  persistentMultipleTabManager(),
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
  }),
});

// Cloud Functions — india region for lowest latency
export const functions = getFunctions(app, 'asia-south1');

// Local emulators (development only)
if (import.meta.env.VITE_USE_EMULATOR === 'true') {
  try {
    connectAuthEmulator(auth,    'http://localhost:9099', { disableWarnings: true });
    connectFirestoreEmulator(db,  'localhost', 8080);
    connectFunctionsEmulator(functions, 'localhost', 5001);
  } catch {
    // Already connected — safe to ignore (React HMR)
  }
}

export const ADMIN_UID = import.meta.env.VITE_ADMIN_UID || '';
