# Backend setup for NFC Tag Manager

The **backend** is this same Next.js project. The API (login, Google auth, tags, etc.) lives in `app/api/`. You need to run it somewhere and set a few env vars.

---

## Option A: Deploy to Vercel (recommended for production)

1. **Push your code** to GitHub (if not already).

2. **Import the project in Vercel**
   - Go to [vercel.com](https://vercel.com) → Add New → Project → Import your repo.
   - Root directory: `my-nfc-webapp` (or wherever this Next.js app is).
   - Deploy.

3. **Add environment variables** (Vercel project → Settings → Environment Variables):

   | Variable | Value | Required for |
   |----------|--------|----------------|
   | `DATABASE_URL` | Your Postgres URL (e.g. from [Neon](https://neon.tech)) | Everything |
   | `NEXTAUTH_SECRET` | Random string, e.g. run `openssl rand -base64 32` | Web + Android auth |
   | `NEXTAUTH_URL` | Your Vercel URL, e.g. `https://your-project.vercel.app` | Web login |
   | `GOOGLE_ANDROID_CLIENT_ID` | Your **Android** OAuth client ID (same as in `android/local.properties`) | Android “Sign in with Google” |

   Optional (for “Sign in with Google” on the **website**):

   | Variable | Value |
   |----------|--------|
   | `GOOGLE_CLIENT_ID` | Web OAuth client ID from Google Cloud |
   | `GOOGLE_CLIENT_SECRET` | Web OAuth client secret |

4. **Redeploy** after adding/changing env vars.

5. **Point the Android app at your backend**
   - In `android/app/src/main/java/.../data/ApiClient.kt`, set `BASE_URL` to:
     - `https://YOUR-VERCEL-URL.vercel.app/api/`
   - Rebuild the Android app.

---

## Option B: Run locally (for development)

1. **Database**
   - Use a local Postgres or a free [Neon](https://neon.tech) / [Supabase](https://supabase.com) Postgres.
   - Create a `.env` or `.env.local` in the **project root** (same folder as `package.json`).

2. **`.env.local`** (create in project root):

   ```env
   DATABASE_URL="postgresql://user:password@host:5432/dbname"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="pick-a-long-random-string-at-least-32-chars"
   GOOGLE_ANDROID_CLIENT_ID="your-android-client-id.apps.googleusercontent.com"
   ```

3. **Run the backend**
   ```bash
   npm install
   npx prisma db push
   npm run dev
   ```
   Backend will be at `http://localhost:3000`.

4. **Android app → local backend**
   - **Emulator:** use `http://10.0.2.2:3000/api/` as `BASE_URL` in `ApiClient.kt`.
   - **Physical device:** use your PC’s LAN IP, e.g. `http://192.168.1.x:3000/api/` (same Wi‑Fi as the phone).

---

## Checklist

- [ ] Next.js app runs somewhere (Vercel or `npm run dev`).
- [ ] `DATABASE_URL` set and Prisma applied (`npx prisma db push` or migrations).
- [ ] `NEXTAUTH_SECRET` set.
- [ ] `GOOGLE_ANDROID_CLIENT_ID` set (same value as in Android `local.properties`).
- [ ] Android app’s `ApiClient.kt` `BASE_URL` points at that backend (e.g. `https://your-app.vercel.app/api/` or your local URL).

After that, login (including “Sign in with Google” on Android) will use this backend.
