// Firebase Configuration Template
// This is where you'll paste your Firebase config from the console
// 
// Steps to get your Firebase config:
// 1. Go to https://console.firebase.google.com/
// 2. Select your project
// 3. Click the settings gear icon (top left)
// 4. Click "Project settings"
// 5. Scroll down to "Your apps" section
// 6. Find your web app
// 7. Copy the config object shown in the code snippet
// 8. Replace the placeholder values below with your actual config
//
// The config object looks like:
// {
//   apiKey: "AIz...",
//   authDomain: "project.firebaseapp.com",
//   projectId: "project-id",
//   storageBucket: "project.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "1:123456789:web:abcd1234..."
// }

const firebaseConfig = {
  apiKey: "PASTE_YOUR_FIREBASE_WEB_API_KEY_HERE",
  authDomain: "PASTE_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PASTE_YOUR_PROJECT_ID_HERE",
  storageBucket: "PASTE_YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "PASTE_YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "PASTE_YOUR_APP_ID_HERE",
  measurementId: "PASTE_YOUR_MEASUREMENT_ID_HERE"
};

// Usage:
// Update `assets/js/firebase-config.js` to set `window.__FIREBASE_CONFIG`.
// This web config is used by the client and is not a server secret.
