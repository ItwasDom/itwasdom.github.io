// Initializes Firebase (compat) once, if the SDK is present.
(function () {
  if (!window.firebase || !window.__FIREBASE_CONFIG) return;
  if (firebase.apps && firebase.apps.length) return;

  firebase.initializeApp(window.__FIREBASE_CONFIG);
})();
