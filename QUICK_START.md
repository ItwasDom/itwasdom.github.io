# Portfolio Like & Follow System - Quick Start

## Files Created

1. **portfolio/feed-new.html** - New portfolio page with Firebase authentication, likes, and follow system
2. **FIREBASE_SETUP.md** - Complete Firebase setup guide
3. **functions/index.js** - Cloud Functions for email notifications
4. **functions/package.json** - Cloud Functions dependencies

## What's Ready

### User Authentication System ✅
- Email/Password signup
- Email/Password login
- User profiles stored in Firestore
- Notification opt-in during signup
- Logout functionality

### Like System ✅
- One like per user per photo (enforced)
- Real-time like count updates
- Like button visual feedback (fills red when liked)
- Persistent like storage in Firestore
- Like count shown in overlay hover
- Only authenticated users can like

### Follow System ✅
- One follow per user (enforced)
- Real-time follower count updates
- "Following" state shows on button
- Persistent follow storage in Firestore
- Follow count displayed on profile

### Email Notifications ✅
- Notification when photo is liked (sent to Dominic)
- Notification when new follower (sent to Dominic)
- User opt-in during signup
- Stylized HTML emails with branding
- Cloud Functions based (serverless)

## Next Steps

### Step 1: Setup Firebase Project (5 minutes)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project: "dominic-martinez-portfolio"
3. Create web app
4. Copy the config object
5. Paste into `portfolio/feed-new.html` lines 459-466

### Step 2: Enable Services (5 minutes)
Go to Firebase Console:
- **Authentication**: Enable Email/Password auth
- **Firestore**: Create database in test mode
- **Cloud Functions**: Enable (we'll deploy functions later)

### Step 3: Set Firestore Rules (2 minutes)
Go to **Firestore → Rules** and paste:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow create: if request.auth.uid != null;
      allow read, update: if request.auth.uid == userId;
    }
    match /photos/{photoId} {
      allow read: if true;
      allow write: if false;
    }
    match /profile/{profileId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Step 4: Create Collections in Firestore (2 minutes)

**Create manually:**
1. Go to **Firestore Database**
2. Click "Start collection"
3. Create collection: `profile`
4. Add document with ID: `dominic`
5. Add field: `followers: 0` (type: number)
6. Create collection: `photos`
7. Add 4 documents (IDs: project-1, project-2, project-3, project-4)
8. Each with field: `likeCount: 0` (type: number)

### Step 5: Deploy Cloud Functions (10 minutes)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Navigate to project root:
   ```bash
   cd itwasdom.github.io
   ```

3. Deploy:
   ```bash
   firebase deploy --only functions
   ```

4. Set environment variables in Firebase Console:
   - `GMAIL_EMAIL`: your gmail
   - `GMAIL_PASSWORD`: Gmail app password (NOT your regular password!)
   - `ADMIN_EMAIL`: dominic's email

### Step 6: Replace Old Feed File (1 minute)
1. Rename `portfolio/feed.html` → `portfolio/feed-backup.html`
2. Rename `portfolio/feed-new.html` → `portfolio/feed.html`

### Step 7: Test Everything (5 minutes)
1. Go to website
2. Click "Sign In" button
3. Create account with notifications enabled
4. Hover over portfolio items to see likes (should be 0)
5. Click heart button to like
6. Follower count should update
7. Check email for notifications

## Architecture

```
├── portfolio/feed.html          ← Updated with auth & real-time updates
├── functions/
│   ├── index.js               ← Email notification serverless functions
│   └── package.json          ← Cloud Function dependencies
├── FIREBASE_SETUP.md          ← Full setup documentation
└── Firestore Collections:
    ├── users/{userId}        ← User profiles & preferences
    ├── photos/{photoId}      ← Like counts per photo
    └── profile/dominic       ← Follower count
```

## Features Summary

| Feature | Implemented | Real-time | Persistent |
|---------|------------|-----------|-----------|
| Authentication | ✅ | ✅ | ✅ |
| One Like Per User | ✅ | ✅ | ✅ |
| Like Count | ✅ | ✅ | ✅ |
| Follow System | ✅ | ✅ | ✅ |
| Follower Count | ✅ | ✅ | ✅ |
| Email Notifications | ✅ | ✅ | ✅ |
| Push Notifications | ⏳ | - | - |

## Testing Checklist

- [ ] Firebase project created
- [ ] Web app added to Firebase
- [ ] Config pasted into feed.html
- [ ] Email/Password authentication enabled
- [ ] Firestore database created
- [ ] Firestore rules applied
- [ ] Collections created (profile, photos)
- [ ] Cloud Functions deployed
- [ ] Gmail app password configured
- [ ] Sign up works without errors
- [ ] Can like photos (button turns red)
- [ ] Like count increments
- [ ] Follower count updates
- [ ] Email received for likes
- [ ] Email received for follows
- [ ] Already-liked photos show red on reload

## Support Troubleshooting

**"Firebase is not defined"**
- Verify firebase-app.js SDK is loading
- Check browser console for 404 errors

**"User unauthorized"** on like/follow
- Check Firestore rules are applied correctly
- Verify Firestore collections exist

**Emails not sending**
- Verify Gmail app password (not regular password)
- Check Cloud Functions logs in Firebase console
- Ensure ADMIN_EMAIL is set

**Portfolio items not loading**
- Check image paths are correct
- Verify portfolio array in feed.html matches image names

## Next Future Features

Once this is working:
- [ ] Comments system
- [ ] Direct messaging
- [ ] User profile pages
- [ ] Photo tags/hashtags
- [ ] Like notifications in-app notifications
- [ ] Photo upload
- [ ] Story feature
- [ ] Activity feed
