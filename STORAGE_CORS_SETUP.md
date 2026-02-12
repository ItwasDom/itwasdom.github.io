# Firebase Storage CORS Setup (for Local Dev + Safari)

If uploads from the admin pages fail with Safari console errors like:
- `Preflight response is not successful (404)`
- `XMLHttpRequest cannot load https://firebasestorage.googleapis.com/... due to access control checks`

…your Storage bucket likely does **not** have CORS configured to allow your dev origin.

## 1) Install gcloud / gsutil

You need `gsutil` (comes with the Google Cloud SDK).

- Install: https://cloud.google.com/sdk/docs/install
- Then run: `gcloud init`

Quick sanity check (optional): confirm the bucket actually exists.

```bash
gcloud storage buckets list --project dominic-martinez-portfolio
```

If this prints nothing, you likely haven’t enabled Firebase Storage for the project yet (or the default bucket was deleted).
Go to Firebase Console → Build → Storage → Get started, and confirm the bucket name shown there.

## 2) Create a CORS JSON file

Create a file named `cors.json` with this content (adjust origins as needed):

```json
[
  {
    "origin": [
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://127.0.0.1",
      "http://localhost",
      "https://dominic-martinez-portfolio.firebaseapp.com",
      "https://dominic-martinez-portfolio.web.app",
      "https://itwasdom.github.io"
    ],
    "method": ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    "responseHeader": ["Content-Type", "Authorization", "x-goog-resumable"],
    "maxAgeSeconds": 3600
  }
]
```

Notes:
- If you use a different local port, add it (e.g. `http://127.0.0.1:5173`).
- Keep the origins list tight; only include places you actually run the site.

## 3) Apply it to your bucket

Your bucket is:
- `dominic-martinez-portfolio.firebasestorage.app`

Run:

```bash
gsutil cors set cors.json gs://dominic-martinez-portfolio.firebasestorage.app
```

If you see `NotFoundException: 404 The specified bucket does not exist`, double-check the bucket name in Firebase Console → Storage.
If the bucket name is different, use that in the `gs://...` command and update `storageBucket` in `assets/js/firebase-config.js`.

(Optional) Verify:

```bash
gsutil cors get gs://dominic-martinez-portfolio.firebasestorage.app
```

## 4) Reload Safari

In Safari:
- `Develop → Empty Caches`
- Reload the admin page
- Try uploading again

## Related: API key + Auth domains

If Auth/Firestore is also failing locally, you may additionally need:
- Firebase Console → Authentication → Settings → Authorized domains: add `127.0.0.1` and `localhost`
- Google Cloud Console → Credentials → API key HTTP referrers: allow your local origin(s) and hosting origin(s)
