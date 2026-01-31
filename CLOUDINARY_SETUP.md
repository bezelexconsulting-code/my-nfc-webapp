# Cloudinary Image Storage Setup

Cloudinary provides free, permanent cloud storage for your NFC tag images. No more losing images on Vercel deployments!

## Free Tier Includes:
- ✅ 25GB storage
- ✅ 25GB bandwidth/month
- ✅ Automatic image optimization
- ✅ Automatic format conversion (WebP)
- ✅ Image transformations

---

## Setup Instructions

### Step 1: Create Cloudinary Account

1. Go to: https://cloudinary.com/users/register_free
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your Credentials

1. Log in to your Cloudinary dashboard: https://console.cloudinary.com/
2. You'll see your credentials on the dashboard:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Add to Vercel Environment Variables

1. Go to your Vercel project: https://vercel.com/donovans-projects-17201c26/my-nfc-webapp/settings/environment-variables

2. Add these three environment variables:

   | Name | Value |
   |------|-------|
   | `CLOUDINARY_CLOUD_NAME` | Your cloud name (e.g., `dxyz123abc`) |
   | `CLOUDINARY_API_KEY` | Your API key (e.g., `123456789012345`) |
   | `CLOUDINARY_API_SECRET` | Your API secret (e.g., `abcdefg...`) |

3. Click **Save** for each one

### Step 4: Add to Local Development (Optional)

If you're running the app locally, create/update your `.env` file:

```env
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### Step 5: Redeploy

After adding the environment variables to Vercel, redeploy your app:

```bash
vercel --prod
```

---

## ✅ What's Included

The Cloudinary integration automatically:

1. **Uploads images to cloud** - Permanent storage, no more deletions
2. **Optimizes images** - Reduces file size without quality loss
3. **Converts to WebP** - Faster loading on modern browsers
4. **Resizes large images** - Max 800x800px to save bandwidth
5. **Organizes in folder** - All images in `nfc-tags/` folder

---

## 📊 Monitor Usage

Check your usage anytime at:
https://console.cloudinary.com/console/lui/dashboard

---

## 🔒 Security Note

Keep your `CLOUDINARY_API_SECRET` private! Never commit it to Git or share it publicly.

---

## Need Help?

Cloudinary documentation: https://cloudinary.com/documentation
