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
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};

// Usage:
// Add this to your feed.html file around line 459
// Simply replace the firebaseConfig object in feed.html with these values
// Do NOT commit this to version control with real credentials!
// Use environment variables or Firebase remote config in production
