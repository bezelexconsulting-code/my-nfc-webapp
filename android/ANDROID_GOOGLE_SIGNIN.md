# Android Google Sign-In Setup

## 1. Create OAuth client in Google Cloud

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Create OAuth client ID → **Application type: Android**.
3. **Name:** e.g. "NFC Tag Manager (Android)".
4. **Package name:** `com.vinditscandit.nfctagmanager`
5. **SHA-1 certificate fingerprint (debug):**
   ```bash
   cd android && ./gradlew signingReport
   ```
   Use the **SHA1** value under `Variant: debug` (e.g. `75:38:C3:B6:...`).
6. Create the client and copy the **Client ID** (e.g. `123456789-xxx.apps.googleusercontent.com`).

## 2. Configure the app

Add the Android client ID to **`android/local.properties`** (create the file if it doesn’t exist):

```properties
GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

Do not commit `local.properties` if it contains secrets (it is usually in `.gitignore`).

## 3. Configure the backend

Add the same Android client ID to your **backend** env (e.g. Vercel / `.env`):

```env
GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

The backend uses this to accept ID tokens from the Android app (`POST /api/auth/google`).

## 4. Release builds

For release (e.g. Play Store), create a **release** OAuth client in Google Cloud with:

- Same package name: `com.vinditscandit.nfctagmanager`
- SHA-1 from your **release** keystore (from your signing config).

You can add multiple SHA-1 fingerprints to one Android OAuth client in the console.

## Summary

| Where              | What to set |
|--------------------|-------------|
| Google Cloud       | Android OAuth client (package + SHA-1) |
| `android/local.properties` | `GOOGLE_ANDROID_CLIENT_ID=...` |
| Backend env        | `GOOGLE_ANDROID_CLIENT_ID=...` (same value) |

After that, “Sign in with Google” in the Android app will work.
