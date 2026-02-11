# Admin Dashboard Setup Guide

## Overview

You now have a complete admin dashboard for uploading and managing photos on your portfolio. Photos uploaded through the admin panel appear immediately on your portfolio site and can be liked by visitors.

## Quick Access

Visit: `https://yoursite.com/admin/` (redirects to `admin/dashboard.html`)

## Initial Setup

### Step 1: Create an Admin Account (Firebase Auth)

1. Go to Firebase Console → **Authentication** → **Users**
2. Click **Add user** and create an email/password user for admin
3. Copy the admin user's UID

### Step 2: Set `ADMIN_UID` in Admin Pages

Update the `ADMIN_UID` constant in these files to match your admin UID:
- `admin/dashboard.html`
- `admin/content.html`
- `admin/portfolio.html`
- `admin/profile.html`

### Step 3: Update Firestore Rules (Lock writes to Admin UID)

Make sure your Firestore rules include the portfolio collection. Go to **Firebase Console → Firestore → Rules** and verify this rule is present:

```
match /portfolio/{photoId} {
  allow read: if true;
  allow create, update, delete: if request.auth != null && request.auth.uid == "<ADMIN_UID>";
}
```

If you haven't already updated your rules, replace all rules with:

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

    match /portfolio/{photoId} {
      allow read: if true;
      allow create, update, delete: if request.auth != null && request.auth.uid == "<ADMIN_UID>";
    }

    match /profile/{profileId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

Then click **Publish** to apply the rules.

## Using the Admin Dashboard

### Login

1. Go to `/admin/`
2. Sign in with your Firebase Auth admin email/password

### Upload a Photo

1. **Drag & Drop**: Drag an image file onto the upload area, or click to browse
2. **Fill the form**:
   - **Photo Title**: Name of the photo (e.g., "Mountain Sunset")
   - **Description**: Optional description
   - **Category**: Select a category (Portrait, Cinematography, Architecture, Nature, Events, Other)
3. Click **Upload Photo**
4. The photo appears instantly on your portfolio site!

### Manage Photos

Your uploaded photos appear in the right column. Each photo shows:
- Thumbnail image
- Title and category
- Upload date
- Like count (real-time)
- **Delete button** to remove photos

### Delete a Photo

1. Find the photo in your photos list
2. Click the red **Delete** button
3. Confirm the deletion
4. The photo is removed from Firebase Storage and Firestore immediately

### Logout

Click the **Logout** button in the top right to exit. You'll need to re-enter your password to access the dashboard again.

## Features

✅ **Drag-and-drop uploads** - Easy photo importing
✅ **Automatic metadata storage** - Title, description, category saved
✅ **Real-time display** - Photos appear on portfolio instantly
✅ **Like tracking** - See how many likes each photo gets
✅ **Photo management** - Delete photos anytime
✅ **Secure admin access** - Password-protected dashboard
✅ **Firebase integration** - All data synced with your database

## File Structure

```
admin/
└── index.html          ← Admin dashboard (holds CSS, JS, HTML)

Firestore Collections:
├── portfolio/          ← Stores uploaded photos
│   └── {photoId}
│       ├── title: string
│       ├── description: string
│       ├── category: string
│       ├── imageUrl: string (Firebase Storage URL)
│       ├── likeCount: number
│       ├── createdAt: timestamp
│       └── uploadedBy: "admin"
├── users/              ← User profiles (existing)
├── photos/             ← Legacy portfolio photos (existing)
└── profile/            ← Profile metadata (existing)

Firebase Storage:
└── portfolio/          ← Stores actual image files
    └── {photoId}       ← Image file
```

## Troubleshooting

### "Incorrect password"
- Verify you're using the exact password you set in line ~184 of `admin/index.html`
- Passwords are case-sensitive
- Clear browser cache if still having issues: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)

### Photos not appearing on portfolio site
- Verify you've updated the Firestore rules (Step 2 above)
- Check browser console (F12 → Console) for Firebase errors
- Make sure images are less than 50MB
- Try a different image format (JPG, PNG, WebP are best)

### Can't login to Firebase Console
- Verify your Firebase project exists at console.firebase.google.com
- Check that you're logged into the correct Google account
- Firestore database must be created before uploading photos

### Photos uploading but not showing like counts
- Wait a few seconds - real-time sync from Firebase can take milliseconds
- Refresh the page (F5)
- Check that Firestore rules were published (not just saved as draft)

### Delete button not working
- Ensure you're logged in with your admin password
- Check browser console (F12) for specific errors
- Verify admin is authenticated to Firebase
- Try refreshing and deleting again

## Security Notes

- 🔐 Your admin password is **only stored in the HTML file** - not sent anywhere
- 🔐 Only authenticated Firebase users can upload photos (admin at `/admin/`)
- 🔐 Your Firestore rules prevent unauthorized database modifications
- 🔐 **Don't share your admin password** - anyone with it can modify your portfolio
- 🔐 Change your password regularly if you're concerned about security

## Next Steps

After setting up the admin dashboard:

1. ✅ Upload your first few photos
2. ✅ Test the like button (create a test account on the portfolio)
3. ✅ Verify Real-time updates are working
4. ✅ (Optional) Deploy Cloud Functions for email notifications

## Support

If you encounter issues:

1. Check the browser console (F12 → Console) for error messages
2. Verify all Firestore collections and rules are properly set
3. Ensure Firebase SDK is loading from the CDN
4. Try uploading a smaller image file first

## Advanced: Change Admin Password

To change your admin password:

1. Open `admin/index.html`
2. Find line ~184: `const ADMIN_PASSWORD = "..."`
3. Change to your new password
4. Save the file
5. You'll now need to use the new password to login

**Note**: Old passwords stop working immediately after you update the file.

---

**Enjoy managing your portfolio! 🚀**
