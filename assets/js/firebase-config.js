// Shared Firebase configuration (non-secret). Used by all site pages.
// If you clone this repo for a different Firebase project, update values here.

// NOTE: Firebase Web API keys are intentionally public identifiers, not server secrets.
// If a key is flagged/leaked, rotate it in Google Cloud and restrict it (HTTP referrers + API restrictions),
// then update this file with the new value.

window.__FIREBASE_CONFIG = Object.freeze({
  // TODO: paste your rotated/restricted key here
  apiKey: "AIzaSyA4LWCSks_Qi420PQJZDHvw1Y_StL-RKCM",
  authDomain: "dominic-martinez-portfolio.firebaseapp.com",
  projectId: "dominic-martinez-portfolio",
  storageBucket: "dominic-martinez-portfolio.firebasestorage.app",
  messagingSenderId: "339938102474",
  appId: "1:339938102474:web:0b95e7cb6af8b9c559b833",
  measurementId: "G-MSKQYN75ML",
});

if (
  typeof window.__FIREBASE_CONFIG?.apiKey === "string" &&
  window.__FIREBASE_CONFIG.apiKey === "PASTE_YOUR_FIREBASE_WEB_API_KEY_HERE"
) {
  // eslint-disable-next-line no-console
  console.warn(
    "Firebase is not configured: update assets/js/firebase-config.js with your Firebase web config."
  );
}
