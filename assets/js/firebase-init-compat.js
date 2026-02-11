// Initializes Firebase (compat) once, if the SDK is present.
(function () {
  if (!window.firebase || !window.__FIREBASE_CONFIG) return;
  if (firebase.apps && firebase.apps.length) return;

  firebase.initializeApp(window.__FIREBASE_CONFIG);

  // Safari (and some local/proxy environments) can have issues with Firestore's
  // default streaming transport. These settings make the connection more robust.
  try {
    if (typeof firebase.firestore === "function") {
      const db = firebase.firestore();
      if (db && typeof db.settings === "function") {
        db.settings({
          // Keep any existing settings (e.g., host overrides) if present.
          merge: true,
          experimentalAutoDetectLongPolling: true,
          experimentalForceLongPolling: true,
          useFetchStreams: false,
        });
      }
    }
  } catch {
    // Ignore: Firestore SDK might not be loaded on every page.
  }
})();
