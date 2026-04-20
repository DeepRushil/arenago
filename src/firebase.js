// ArenaGO — Firebase configuration
// Google Services used:
//   1. Firebase Authentication  (firebase/auth)
//   2. Cloud Firestore           (firebase/firestore)
//   3. Firebase Storage          (firebase/storage)
//   4. Firebase Analytics / GA4  (firebase/analytics)
//   5. Firebase App Check        (firebase/app-check)

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth }                         from 'firebase/auth';
import { getFirestore }                    from 'firebase/firestore';
import { getStorage }                      from 'firebase/storage';
import { getAnalytics, logEvent }          from 'firebase/analytics';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// ─── Required env-var guard ───────────────────────────────────────────────────
const REQUIRED_VARS = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];
REQUIRED_VARS.forEach((v) => {
  if (!import.meta.env[v] || import.meta.env[v].startsWith('your_')) {
    console.warn(`[ArenaGO] Missing or placeholder env var: ${v}`);
  }
});

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Detect whether developer has filled in real config values
export const IS_FIREBASE_CONFIGURED =
  !!import.meta.env.VITE_FIREBASE_API_KEY &&
  !import.meta.env.VITE_FIREBASE_API_KEY.startsWith('your_');

let app, auth, db, storage, analytics;

if (IS_FIREBASE_CONFIGURED) {
  // Reuse existing app during Vite HMR to avoid "duplicate-app" errors
  app     = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth    = getAuth(app);
  db      = getFirestore(app);
  storage = getStorage(app);  // Firebase Storage — Google Cloud Storage backend

  if (typeof window !== 'undefined') {
    // ── Firebase Analytics (Google Analytics 4) ──────────────────────────────
    if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
      try { analytics = getAnalytics(app); } catch { /* blocked by adblocker */ }
    }

    // ── Firebase App Check (reCAPTCHA v3) ────────────────────────────────────
    if (import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
      try {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true,
        });
      } catch { /* App Check already initialized during HMR */ }
    }
  }
}

/**
 * Logs a Firebase Analytics event safely (no-ops if analytics unavailable).
 * @param {string} eventName - GA4 event name
 * @param {object} [params]  - Optional event parameters
 */
export function trackEvent(eventName, params = {}) {
  if (analytics) {
    try { logEvent(analytics, eventName, params); } catch { /* silent */ }
  }
}

export { auth, db, storage, analytics };
export default app;
