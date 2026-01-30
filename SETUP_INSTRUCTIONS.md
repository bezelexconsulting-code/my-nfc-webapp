# Setup Instructions for New Features

## 🚀 Quick Start

### 1. Run Database Migration

**CRITICAL**: You must run this migration to add the new database fields:

```bash
npx prisma migrate dev --name add_email_verification_and_image
```

This will add:
- Email verification fields to `Client` model
- `imageUrl` field to `Tag` model

### 2. Create Uploads Directory

Create the directory for image uploads:

```bash
mkdir -p public/uploads
```

**Note**: For production, consider using cloud storage (AWS S3, Cloudinary, etc.) instead of local file storage.

### 3. Update Environment Variables

Make sure these are set in your `.env` file:

```env
DATABASE_URL=your_database_url
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your_email@gmail.com
EMAIL_SERVER_PASSWORD=your_app_password
EMAIL_FROM=your_email@gmail.com
NEXTAUTH_URL=http://localhost:3000  # or your production URL
```

### 4. Install Dependencies (if needed)

All dependencies should already be installed, but if you encounter issues:

```bash
npm install
```

### 5. Generate Prisma Client

After migration:

```bash
npx prisma generate
```

## ✅ Features Now Available

### 1. Email Verification
- New users receive verification email
- Click link in email to verify
- Dashboard shows banner if not verified
- Resend verification option available

### 2. Profile Settings
- Access at `/client/settings`
- Update username, email, password
- Export account data (JSON)
- Delete account option

### 3. Bulk Operations
- Click "Bulk Select" button on dashboard
- Select multiple tags with checkboxes
- Bulk delete selected tags
- Select All / Deselect All buttons

### 4. Image Upload
- Upload images for tags (max 5MB)
- Supported formats: JPEG, PNG, GIF, WebP
- Images displayed on public tag pages
- Preview in tag edit form

### 5. Offline Mode
- Service worker automatically registers
- Public tag pages cached for offline access
- Offline indicator shows connection status
- Previously viewed tags available offline

### 6. Welcome Tutorial
- Automatically shows for new users (0 tags)
- 6-step interactive guide
- Can be skipped or closed
- Remembers completion status

### 7. Search and Filtering
- Search bar on dashboard
- Search by name, slug, phone, or address
- Sort by: Name, Newest First, Recently Updated
- Real-time filtering

### 8. Dark Mode
- Toggle button in header
- System preference detection
- Persists user preference
- Applied throughout app

### 9. Simple Analytics
- Tag count displayed on dashboard
- Shows total tags owned
- Updates in real-time

## 🧪 Testing Checklist

- [ ] Register new account → Check email for verification link
- [ ] Verify email → Check dashboard banner disappears
- [ ] Update profile in settings
- [ ] Change password in settings
- [ ] Export data from settings
- [ ] Upload image to a tag
- [ ] View public tag page with image
- [ ] Search for tags
- [ ] Sort tags
- [ ] Select multiple tags → Bulk delete
- [ ] Toggle dark mode
- [ ] Go offline → Check cached pages work
- [ ] Create account with 0 tags → See welcome tutorial

## 📝 Notes

- **Image Storage**: Currently uses local file storage. For production, consider cloud storage.
- **Service Worker**: May take a moment to register on first load
- **Email Verification**: Check spam folder if email doesn't arrive
- **Dark Mode**: Some components may need additional dark mode classes added

## 🐛 Troubleshooting

### Migration Fails
- Make sure database is accessible
- Check DATABASE_URL is correct
- Try: `npx prisma db push` as alternative

### Images Not Uploading
- Check `public/uploads` directory exists
- Verify write permissions
- Check file size (max 5MB)

### Service Worker Not Working
- Check browser console for errors
- Verify `/sw.js` is accessible
- Try hard refresh (Ctrl+Shift+R)

### Dark Mode Not Working
- Clear browser cache
- Check browser supports dark mode
- Verify ThemeProvider is in layout

## 🎉 You're All Set!

All features are implemented and ready to use. Enjoy your enhanced NFC Tag Manager!
