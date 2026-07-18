'use client';

import { useEffect } from 'react';

import { initAnalytics } from '../lib/firebase';

/**
 * Mounts Firebase Analytics once on the client. Rendered nothing — it only runs
 * the side effect. `initAnalytics` feature-detects support and dynamically
 * imports `firebase/analytics`, so this stays out of the server bundle and out
 * of first paint on browsers where Analytics can't run.
 */
export function FirebaseAnalytics() {
  useEffect(() => {
    void initAnalytics();
  }, []);
  return null;
}
