# Custom Domain Setup Guide

This guide will help you add a custom domain to your NFC webapp.

## Step 1: Update Environment Variables

### For Production (.env.production)
Add or update these variables with your custom domain:

```env
# Replace ''yourdomain.com'' with your actual domain
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Email Configuration (keep existing values)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=app.vinditscandit@gmail.com
EMAIL_SERVER_PASSWORD=oewo stkd uvbl shzt
EMAIL_FROM=app.vinditscandit@gmail.com

# Public Admin Password (change this!)
NEXT_PUBLIC_ADMIN_PASSWORD=your-secure-admin-password
```

### For Local Development (.env.local)
Keep localhost for development:
```env
NEXTAUTH_URL=http://localhost:3000
```

## Step 2: Vercel Domain Configuration

### Option A: Using Vercel Dashboard
1. Go to your Vercel project dashboard
2. Navigate to Settings → Domains
3. Add your custom domain
4. Configure DNS records as instructed by Vercel

### Option B: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Add domain to your project
vercel domains add yourdomain.com
```

## Step 3: DNS Configuration

### For Root Domain (yourdomain.com)
Add an A record pointing to Vercel''s IP:
```
Type: A
Name: @
Value: 76.76.19.61
```

### For Subdomain (www.yourdomain.com)
Add a CNAME record:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

## Step 4: Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add the following variables for Production:
   - `NEXTAUTH_URL`: `https://yourdomain.com`
   - `NEXTAUTH_SECRET`: `your-secure-secret-key`
   - `DATABASE_URL`: (your existing database URL)
   - `EMAIL_SERVER_HOST`: `smtp.gmail.com`
   - `EMAIL_SERVER_PORT`: `587`
   - `EMAIL_SERVER_USER`: `app.vinditscandit@gmail.com`
   - `EMAIL_SERVER_PASSWORD`: `oewo stkd uvbl shzt`
   - `EMAIL_FROM`: `app.vinditscandit@gmail.com`
   - `NEXT_PUBLIC_ADMIN_PASSWORD`: `your-secure-admin-password`

## Step 5: Deploy and Test

1. Deploy your changes:
   ```bash
   vercel --prod
   ```

2. Test the following functionality:
   - [ ] Homepage loads correctly
   - [ ] Admin login works
   - [ ] Client registration/login works
   - [ ] Password reset emails are sent
   - [ ] NFC tag creation and viewing works
   - [ ] Public tag pages load correctly

## Important Security Notes

1. **Change the admin password** from `secret123` to something secure
2. **Update NEXTAUTH_SECRET** to a random, secure string
3. **Enable HTTPS** - Vercel provides this automatically
4. **Test email functionality** after domain change

## Troubleshooting

### Common Issues:

1. **Authentication not working**: Check NEXTAUTH_URL matches your domain exactly
2. **Emails not sending**: Verify EMAIL_FROM domain matches or is authorized
3. **404 errors**: Check DNS propagation (can take up to 48 hours)
4. **SSL certificate issues**: Wait for Vercel to provision certificates (usually 5-10 minutes)

### DNS Propagation Check
Use online tools like:
- https://dnschecker.org/
- https://www.whatsmydns.net/

## Example Complete Setup

For domain `mynfcapp.com`:

1. DNS Records:
   ```
   A     @     76.76.19.61
   CNAME www   cname.vercel-dns.com
   ```

2. Environment Variables:
   ```env
   NEXTAUTH_URL=https://mynfcapp.com
   NEXTAUTH_SECRET=super-secret-key-change-this
   # ... other variables
   ```

3. Vercel Domain: Add `mynfcapp.com` and `www.mynfcapp.com`

After setup, your NFC webapp will be accessible at your custom domain with full functionality.
