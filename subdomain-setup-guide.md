# Subdomain Setup Guide: tags.vinditscandit.co.za

This guide will help you set up a professional subdomain for your NFC webapp integration.

## 🎯 Goal
Set up `tags.vinditscandit.co.za` to point to your NFC webapp for seamless e-commerce integration.

## 📋 Prerequisites
- Access to vinditscandit.co.za domain management (DNS settings)
- Admin access to your hosting provider or domain registrar
- Your NFC webapp is deployed on Vercel: `https://my-nfc-webapp-8q973rbco-donovans-projects-17201c26.vercel.app`

## 🚀 Step-by-Step Setup

### Step 1: Access Your Domain DNS Settings

**Option A: Through Your Domain Registrar**
1. Log into your domain registrar (where you bought vinditscandit.co.za)
2. Look for "DNS Management", "DNS Settings", or "Name Servers"
3. Find the DNS records section

**Option B: Through Your Hosting Provider**
1. Log into your hosting control panel (cPanel, Plesk, etc.)
2. Look for "DNS Zone Editor" or "DNS Management"
3. Select vinditscandit.co.za domain

**Option C: Through Cloudflare (if using)**
1. Log into Cloudflare dashboard
2. Select vinditscandit.co.za domain
3. Go to DNS settings

### Step 2: Create the CNAME Record

Add a new DNS record with these details:

```
Type: CNAME
Name: tags
Value: my-nfc-webapp-8q973rbco-donovans-projects-17201c26.vercel.app
TTL: 300 (or Auto)
```

**Important Notes:**
- Use `tags` (not `tags.vinditscandit.co.za`) for the Name field
- Do NOT include `https://` in the Value field
- Some providers may require a trailing dot: `my-nfc-webapp-8q973rbco-donovans-projects-17201c26.vercel.app.`

### Step 3: Configure Vercel Domain

1. Go to your Vercel dashboard: https://vercel.com/donovans-projects-17201c26/my-nfc-webapp
2. Navigate to **Settings** → **Domains**
3. Click **Add Domain**
4. Enter: `tags.vinditscandit.co.za`
5. Click **Add**

Vercel will automatically:
- Verify the DNS configuration
- Issue an SSL certificate
- Set up the domain routing

### Step 4: Update Environment Variables

Update your Vercel environment variables:

1. In Vercel dashboard, go to **Settings** → **Environment Variables**
2. Update or add:
   ```
   NEXTAUTH_URL=https://tags.vinditscandit.co.za
   ```
3. Redeploy your application

### Step 5: Update Integration Code

Update all your e-commerce integration links from:
```html
https://my-nfc-webapp-8q973rbco-donovans-projects-17201c26.vercel.app
```

To:
```html
https://tags.vinditscandit.co.za
```

## 🔍 Verification Steps

### 1. DNS Propagation Check
- Use online tools like `whatsmydns.net` or `dnschecker.org`
- Search for `tags.vinditscandit.co.za`
- Verify it points to your Vercel deployment

### 2. SSL Certificate Check
- Visit `https://tags.vinditscandit.co.za`
- Verify the green lock icon appears
- Certificate should be issued by Let's Encrypt (via Vercel)

### 3. Functionality Test
- Test admin login: `https://tags.vinditscandit.co.za/admin/login`
- Test public tag: `https://tags.vinditscandit.co.za/public-tag/tag-test-1`
- Test client registration: `https://tags.vinditscandit.co.za/register`

## ⏱️ Timeline Expectations

- **DNS Propagation**: 5 minutes to 24 hours (usually within 1 hour)
- **SSL Certificate**: Automatic once DNS is verified (5-10 minutes)
- **Full Functionality**: Available immediately after SSL is active

## 🛠️ Troubleshooting

### Common Issues:

**1. "Domain not found" error**
- Check DNS record is correctly configured
- Wait for DNS propagation (up to 24 hours)
- Verify you used `tags` not `tags.vinditscandit.co.za` in the Name field

**2. SSL certificate issues**
- Ensure DNS is properly configured first
- Wait 10-15 minutes after DNS verification
- Try accessing via `http://` first, then `https://`

**3. "This site can't be reached"**
- Double-check the CNAME value matches exactly
- Ensure no extra spaces or characters in DNS record
- Try using a different DNS checker tool

**4. Vercel shows "Domain Configuration Error"**
- Remove and re-add the domain in Vercel
- Verify DNS record is active and propagated
- Check for conflicting DNS records

## 📞 Support Contacts

If you need help:

1. **Domain/DNS Issues**: Contact your domain registrar or hosting provider
2. **Vercel Issues**: Check Vercel documentation or support
3. **Integration Issues**: Refer to the main integration guide

## 🎉 Success Checklist

- [ ] DNS CNAME record created and propagated
- [ ] Domain added to Vercel project
- [ ] SSL certificate active (green lock)
- [ ] Environment variables updated
- [ ] Integration links updated on e-commerce site
- [ ] Admin login works on new domain
- [ ] Public tag pages load correctly
- [ ] Client registration/login functional

## 🔄 Rollback Plan

If something goes wrong:

1. **Remove DNS record** to stop traffic to subdomain
2. **Update integration links** back to original Vercel URL
3. **Remove domain** from Vercel project settings
4. **Revert environment variables** if needed

Your original Vercel URL will continue working: `https://my-nfc-webapp-8q973rbco-donovans-projects-17201c26.vercel.app`

## 🚀 Next Steps After Setup

1. Update all marketing materials with new domain
2. Set up Google Analytics for the new domain
3. Update any API integrations to use new domain
4. Consider setting up email forwarding (e.g., support@tags.vinditscandit.co.za)
5. Add the new domain to your sitemap and SEO tools