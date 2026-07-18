/**
 * Firebase client for the renderer.
 *
 * Holds the single shared `initializeApp` instance plus lazy accessors for the
 * Realtime Database (where email subscriptions land) and Analytics. Everything
 * here is browser-only: Next.js can import this file from a Server Component's
 * module graph, so the actual Firebase services are created lazily inside the
 * accessors rather than at module-eval time, and Analytics is feature-detected
 * with `isSupported()` so SSR / unsupported browsers don't throw.
 *
 * The config below is the project's **public** web config (the same values
 * Firebase prints in the console snippet). These keys are not secrets — access
 * is governed by Realtime Database security rules, not by hiding the apiKey.
 */
import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Database, getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyAfKRgTTId3loUS91hHhNaNZam6iy_jZhI',
  authDomain: 'ds-appna-io.firebaseapp.com',
  databaseURL: 'https://ds-appna-io-default-rtdb.europe-west1.firebasedatabase.app',
  projectId: 'ds-appna-io',
  storageBucket: 'ds-appna-io.firebasestorage.app',
  messagingSenderId: '533227564158',
  appId: '1:533227564158:web:3107578bf8fd04555c7c2f',
  measurementId: 'G-0XQ31PYDE1',
};

/** Reuse the existing app on Fast Refresh / repeat imports instead of re-initialising. */
export function getFirebaseApp(): FirebaseApp {
  return getApps()[0] ?? initializeApp(firebaseConfig);
}

/** Realtime Database handle. Call only in the browser (e.g. from a client event handler). */
export function getRealtimeDb(): Database {
  return getDatabase(getFirebaseApp());
}

/**
 * Initialise Analytics when the runtime supports it (browser + cookies, etc.).
 * Safe to call from a `useEffect`; resolves to `null` where Analytics can't run.
 */
export async function initAnalytics() {
  if (typeof window === 'undefined') return null;
  const { getAnalytics, isSupported } = await import('firebase/analytics');
  if (!(await isSupported())) return null;
  return getAnalytics(getFirebaseApp());
}
