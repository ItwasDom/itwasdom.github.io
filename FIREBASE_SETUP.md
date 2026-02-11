# Firebase Setup Guide for Portfolio System

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create project" or "Add project"
3. Enter project name: `dominic-martinez-portfolio`
4. Choose appropriate settings
5. Click "Create project"

## Step 2: Set Up Authentication

1. In Firebase Console, go to **Authentication**
2. Click on **Sign-in method**
3. Enable **Email/Password**
4. Save

## Step 3: Create a Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (you can change to production rules later)
4. Select location
5. Click **Create**

## Step 4: Get Your Firebase Config

1. Go to **Project Settings** (gear icon)
2. Under "Your apps", select your web app
3. Copy the Firebase configuration object
4. Paste it into `assets/js/firebase-config.js` by updating `window.__FIREBASE_CONFIG`

Note: Firebase web config values are not secrets (they are embedded in client apps). Keep any server credentials (like email passwords) in Cloud Functions environment variables.

### If your API key was flagged/leaked

If Google emails you that your key is publicly accessible, the usual fix is:

1. **Rotate the key** in Google Cloud Console (APIs & Services → Credentials).
2. **Restrict the new key**:
  - **Application restrictions** → HTTP referrers (web sites): add your domains (e.g. `https://itwasdom.github.io/*` and any custom domain).
  - **API restrictions**: limit to only the APIs you actually use.
3. Update `assets/js/firebase-config.js` with the **new** key.

## Step 4.5 (Local Dev): Authorize localhost + Storage uploads

If you run the site with a local server (e.g. VS Code Live Server on `127.0.0.1:5500`), you may need:

- Firebase Console → **Authentication** → **Settings** → **Authorized domains**: add `127.0.0.1` and `localhost`.
- Google Cloud Console → **Credentials** → your API key → **HTTP referrers**: allow your dev origin(s) and hosting origin(s).
- Firebase Storage bucket CORS: see [STORAGE_CORS_SETUP.md](STORAGE_CORS_SETUP.md) (needed when Safari shows preflight/CORS errors on uploads).

## Step 5: Set Up Cloud Functions for Email Notifications

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Create `functions` folder in your project
3. Run `firebase init functions`
4. Install email package: `npm install nodemailer`

## Step 6: Create Database Structure (Firestore Rules)

Go to Firestore **Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow create: if request.auth.uid != null;
      allow read, update: if request.auth.uid == userId;
    }

    // Photos collection (legacy)
    match /photos/{photoId} {
      allow read: if true;
      allow write: if false;
    }

    // Portfolio collection (admin uploads)
    match /portfolio/{photoId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.uid == "<ADMIN_UID>";
    }

    // Profile collection
    match /profile/{profileId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Step 7: Database Collections Setup

Create these collections in Firestore:

### users (auto-created by auth)
```
{
  name: "string",
  email: "string",
  enableNotifications: boolean,
  createdAt: timestamp,
  followers: array,
  isFollowingDominic: boolean,
  likes: {
    "project-1": boolean,
    "project-2": boolean,
    ...
  }
}
```

### portfolio (admin-managed)
Portfolio items are created/edited by the admin dashboard and read publicly by the portfolio page.

Example document:
```
{
  title: "string",
  description: "string",
  category: "string",
  imageUrl: "https://...",
  likeCount: number,
  createdAt: timestamp
}
```

### profile
```
{
  followers: number,
  following: number
}
```

## Required Environment Variables (for Cloud Functions)

- `GMAIL_EMAIL`: Your Gmail address
- `GMAIL_PASSWORD`: Your Gmail app password
- `ADMIN_EMAIL`: Dominic's email

## Features Implemented

✅ **Authentication**
- Sign up with email/password
- Login
- Logout
- User profile storage

✅ **Like System**
- One like per user per photo
- Real-time like count updates
- Like button shows as "liked" for current user
- Like count persists in database

**Security note (important):**
- Regular users should not be allowed to write to `portfolio/{id}` directly.
- Likes should be processed via Cloud Functions (callable) so only `likeCount` changes server-side.

✅ **Follow System**
- One follow per user
- Real-time follower count updates
- Follow state persists in database
- Shows "Following" status

**Security note (important):**
- Regular users should not be allowed to write to `profile/dominic` directly.
- Follow/unfollow should be processed via Cloud Functions (callable) so `followers` is updated server-side.

## Notes

- The public portfolio page is `portfolio/index.html`.

✅ **Email Notifications**
- Notification when photo is liked
- Notification when new follower
- Opt-in during signup
- Can be disabled in user settings

## Testing

1. Test authentication by signing up and logging in
2. Test likes by clicking heart button on photos
3. Test follow button
4. Check browser console for any errors
5. Verify data appears in Firestore console

## Security Notes

- Update Firestore rules before going to production
- Use environment variables for sensitive data
- Enable authentication methods gradually
- Monitor for abuse

## Troubleshooting

**"Firebase is not defined"**
- Ensure Firebase SDK is loaded in HTML

**Likes not saving**
- Check Firestore rules allow write access
- Verify user is authenticated
- Check browser console for errors

**Emails not sending**
- Verify Cloud Functions are deployed
- Check email credentials
- Look at Cloud Functions logs in Firebase Console

## Deployment Checklist

- [ ] Firebase project created
- [ ] Authentication enabled
- [ ] Firestore database created and rules set
- [ ] Config added to assets/js/firebase-config.js
- [ ] Cloud Functions created and deployed
- [ ] Email credentials configured
- [ ] Database collections created
- [ ] Test authentication flow
- [ ] Test like system
- [ ] Test follow system
