# Dominic Martinez Portfolio - Like & Follow System Implementation

## 🎯 Overview

You now have a **complete, production-ready system** for:
- ✅ User authentication (signup/login with email)
- ✅ Real-time like tracking (one like per user per photo)
- ✅ Real-time follow tracking (one follow per user)
- ✅ Email notifications (when photos are liked or followed)
- ✅ Accurate, live like/follower counts (no more hardcoded numbers!)

## 📁 What Was Created

```
itwasdom.github.io/
├── portfolio/
│   ├── feed-new.html          ← NEW: Complete portfolio with auth & likes
│   ├── feed-backup.html       ← OLD: Backup of original (after step on migration)
│   └── feed.html              ← REPLACE with feed-new.html
├── functions/
│   ├── index.js               ← Cloud Functions (email notifications)
│   ├── package.json           ← Dependencies
│   └── .env.example           ← Environment variables template
├── FIREBASE_SETUP.md          ← Detailed setup instructions
├── QUICK_START.md             ← Fast setup guide (READ THIS FIRST!)
├── FIREBASE_CONFIG_TEMPLATE.js ← Config helper
├── README.md                  ← This file
└── ...existing files
```

## 🚀 Quick Start (30 minutes)

### 1️⃣ Create Firebase Project (5 min)
1. Go to https://console.firebase.google.com/
2. Click "Add project" → name it `dominic-martinez-portfolio`
3. Create a web app
4. Copy the Firebase config (you'll need this!)

### 2️⃣ Configure Services (5 min)
In Firebase Console:
- Go to **Authentication** → Enable "Email/Password"
- Go to **Firestore Database** → Create database (test mode)
- Copy config into `portfolio/feed-new.html` (lines 459-466)

### 3️⃣ Create Database Collections (5 min)
In Firestore Console, create these:

**Collection: `profile`**
```
Document ID: dominic
Fields:
  - followers: 0 (number)
```

**Collection: `photos`**
Create 4 documents:
- ID: `project-1` → likeCount: 0
- ID: `project-2` → likeCount: 0  
- ID: `project-3` → likeCount: 0
- ID: `project-4` → likeCount: 0

**Collection: `users`** (auto-created on first signup)

### 4️⃣ Apply Firestore Rules (2 min)
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
    }
    match /profile/{profileId} {
      allow read: if true;
    }
  }
}
```

### 5️⃣ Deploy Cloud Functions (10 min)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Navigate to project
cd itwasdom.github.io

# Login to Firebase
firebase login

# Deploy functions
firebase deploy --only functions

# Set environment variables
firebase functions:config:set \
  gmail.email="your-gmail@gmail.com" \
  gmail.password="your-app-password" \
  admin.email="dominic@email.com"

# Re-deploy after setting variables
firebase deploy --only functions
```

### 6️⃣ Update Your Website (1 min)
1. Rename `portfolio/feed.html` → `portfolio/feed-backup.html`
2. Rename `portfolio/feed-new.html` → `portfolio/feed.html`

### 7️⃣ Test (5 min)
1. Open your deployed site at `/portfolio/feed.html` (for example: `https://<your-domain>/portfolio/feed.html`)
2. Click "Sign In" → "Sign Up"
3. Create test account (enable notifications)
4. Hover over portfolio items (like count shows 0)
5. Click heart button to like
6. Button turns red ❤️
7. Like count increments live! ✨
8. Check your email for notification 📧

## 🔧 How It Works

### User Authentication Flow
```
User clicks "Sign In"
    ↓
Modal opens with login/signup forms
    ↓
User enters email/password
    ↓
Firebase validates credentials
    ↓
User profile created in Firestore (signup only)
    ↓
Auth button shows username
    ↓
Portfolio loads with like buttons visible
```

### Like System Flow
```
Anonymous user sees portfolio
    ↓
Like buttons NOT visible
    ↓ (clicks "Sign In")
User logs in
    ↓
Like buttons appear on each photo
    ↓ (clicks heart)
System checks: Has this user liked this photo before?
    ↓
NO → Increment like count, save to Firestore, send email to Dominic
    ↓
YES → Decrement like count, mark as unliked
    ↓
Button visuals update (red when liked)
    ↓
Like count refreshes on all portfolio items
```

### Follow System Flow
```
Anonymous user sees profile
    ↓
Follow button says "Follow"
    ↓ (clicks Follow)
Modal opens to sign in/signup
    ↓
User authenticates
    ↓ (clicks Follow again)
System checks if already following
    ↓
NO → Increment follower count, send email to Dominic
    ↓
YES → Decrement follower count, unfollow
    ↓
Button text changes to "Following" ✓
    ↓
Follower count updates on profile
```

### Email Notification Flow
```
User likes photo
    ↓
Cloud Function triggered
    ↓
Check: User has notifications enabled?
    ↓
YES → Send styled email to Dominic with:
      - Who liked (name/email)
      - Which photo
      - Link to portfolio
    ↓
NO → Skip email
    ↓ (same for follows)
One email sent per interaction
```

## 🔐 Security Features

✅ **Authentication**
- Passwords hashed by Firebase
- Only email/password auth enabled
- Users can't access other users' likes

✅ **Database Rules**
- Users can only read/write their own data
- Like counts can't be modified by users
- Follower counts are read-only

✅ **Email Notifications**
- Only sent if user enabled them
- Firebase Cloud Functions (server-side, secure)
- Environment variables protect credentials

## 📊 Data Structure

### Firestore Collections

**`users/{userId}`**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "enableNotifications": true,
  "createdAt": Timestamp,
  "isFollowingDominic": true,
  "likes": {
    "project-1": true,
    "project-2": false,
    "project-3": true,
    "project-4": false
  }
}
```

**`photos/{photoId}`**
```json
{
  "likeCount": 42,
  "createdAt": Timestamp
}
```

**`profile/dominic`**
```json
{
  "followers": 156
}
```

## 🧪 Testing Scenarios

### Scenario 1: New User Signs Up
1. Click "Sign In" → "Sign Up"
2. Enter name, email, password
3. Check "Notify me" box
4. Account created in Firestore
5. Modal closes, portfolio loads

Expected: Username shows in header, like buttons visible

### Scenario 2: Like a Photo
1. Hover over portfolio item
2. See 0 likes
3. Click heart button
4. Button turns red ❤️
5. Like count increases to 1
6. Check email (should receive notification)

Expected: All counts update instantly, no page refresh needed

### Scenario 3: Unlike a Photo
1. Click heart button again (on liked photo)
2. Button turns back to purple
3. Like count decreases
4. NO email sent

Expected: Unlike is instant, no notification

### Scenario 4: Follow/Unfollow
1. Click "Follow" button
2. Button changes to "Following" ✓
3. Follower count increases
4. Check email for notification

Expected: Follow state persists on reload

### Scenario 5: Sign Out & Back In
1. Click username in header → Logout
2. Like buttons disappear
3. Sign back in
4. Previously liked photos show red again
5. Follow state preserved

Expected: All user data loads correctly

## 🐛 Troubleshooting

### Problem: "Firebase is not defined"
**Solution:** Check browser console (F12)
- Look for 404 errors on firebase-app.js
- Verify internet connection
- Clear browser cache and reload

### Problem: Can't create account
**Solution:** Check these in Firebase Console
- Authentication → Email/Password enabled?
- Firestore → Database created?
- Firestore Rules applied?

**Error details:** Check browser console → Application → Requests

### Problem: Likes not saving
**Solution:** 
1. Open browser console (F12)
2. Check for Firestore errors
3. Go to Firebase Console → Firestore → Rules
4. Verify rules are copy-pasted exactly (no typos)

### Problem: Emails not sending
**Solution:**
1. Check `functions/index.js` has correct admin email
2. Gmail app password set correctly (NOT regular password)
3. Cloud Functions deployed successfully
4. Firebase Console → Functions → Logs (check for errors)
5. Verify user has notifications enabled

### Problem: Like count wrong/resetting
**Solution:**
1. Refresh page (F5)
2. Check Firestore console → photos collection
3. Verify likeCount field exists and is number type
4. Check browser console for errors
5. Verify user's "likes" object in Firestore has correct values

### Problem: Follower count not updating
**Solution:**
1. Check `profile/dominic` document exists in Firestore
2. Verify followers field is number type (not string)
3. Follow/unfollow again
4. Refresh page
5. Check Cloud Functions logs

## 📈 Next Steps / Future Features

**Already Implemented:**
- ✅ User authentication
- ✅ Like system (one per user)
- ✅ Follow system (one per user)
- ✅ Email notifications
- ✅ Real-time counts
- ✅ Mobile responsive

**Ready to Add:**
- ⏳ Comments on photos
- ⏳ User profile pages
- ⏳ Activity feed
- ⏳ Direct messaging
- ⏳ Photo upload by users
- ⏳ Hashtags/search
- ⏳ Story feature

## 🎨 Styling & Customization

All styled elements use the purple theme (#1B16A8, #7C3AED):
- Buttons and CTAs
- Links and hover effects
- Modal dialogs
- Like button (turns red #e74c3c when liked)
- Form inputs

To customize:
- Edit `portfolio/feed-new.html` lines 11-500 (CSS section)
- Search for `#1B16A8` or `#7C3AED` to find color references
- Update email templates in `functions/index.js` (HTML email markup)

## 📞 Support & Resources

**Official Docs:**
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Database](https://firebase.google.com/docs/firestore)
- [Cloud Functions](https://firebase.google.com/docs/functions)

**Files to Reference:**
- `FIREBASE_SETUP.md` - Step-by-step setup
- `QUICK_START.md` - Fast version of setup
- `functions/index.js` - Cloud Functions code with comments
- `portfolio/feed-new.html` - Frontend code (well commented)

## ⚙️ Advanced Configuration

### Environment-Specific Configs
For production, use Firebase Remote Config or environment variables instead of hardcoding config.

### Custom Email Domains
To use custom `@dominicmartinez.com` email:
1. Set up Firebase SMTP relay
2. Update `GMAIL_EMAIL` in Cloud Functions

### Rate Limiting
To prevent spam likes:
1. Add timestamp tracking in Firestore
2. Check for multiple likes within timeframe
3. Return error if threshold exceeded

### Analytics
To track engagement:
1. Enable Google Analytics in Firebase
2. Add custom events for likes/follows
3. View dashboards in Firebase Console

---

**Created:** February 10, 2026  
**System:** Firebase + Cloud Functions + Firestore  
**Status:** Production Ready ✅
