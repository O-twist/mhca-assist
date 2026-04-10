import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore,
  initializeFirestore,
  memoryLocalCache
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Initialize Firestore with memory-only cache to prevent IndexedDB assertion errors in iframe
export const db = initializeFirestore(app, {
  localCache: memoryLocalCache()
}, (firebaseConfig as any).firestoreDatabaseId || '(default)');

export const auth = getAuth(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

export default app;
