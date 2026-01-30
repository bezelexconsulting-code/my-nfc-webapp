# Android Studio - First Time Guide

## Step-by-Step Instructions for Beginners

### Step 1: Open the Project ✅ (You've done this!)

1. Open Android Studio
2. File → Open → Select the `android` folder
3. Wait for "Gradle Sync" to complete (bottom right corner)

---

### Step 2: After Sync Completes

Once sync finishes, you should see:
- ✅ No red error messages
- ✅ Project structure on the left side
- ✅ "Build" menu available at the top

**If you see errors:**
- Click "Sync Project with Gradle Files" button (elephant icon) in the toolbar
- Or: File → Sync Project with Gradle Files

---

### Step 3: Set Up a Device (Choose ONE option)

#### Option A: Use a Physical Android Phone (Recommended for NFC testing)

1. **Enable Developer Options on your phone:**
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
   - Go back to Settings → Developer Options
   - Enable "USB Debugging"

2. **Connect your phone:**
   - Connect phone to computer via USB cable
   - On phone, allow USB debugging when prompted
   - In Android Studio, you should see your device appear in the device dropdown (top toolbar)

#### Option B: Create an Android Emulator (Virtual Device)

1. **Open Device Manager:**
   - Click the phone icon in the top toolbar
   - Or: Tools → Device Manager

2. **Create Virtual Device:**
   - Click "Create Device"
   - Select a phone (e.g., "Pixel 6" or "Pixel 7")
   - Click "Next"

3. **Select System Image:**
   - Choose a recent Android version (API 33 or 34)
   - Click "Download" if needed (this takes a while)
   - Click "Next"

4. **Finish Setup:**
   - Click "Finish"
   - Your emulator will appear in the device list

**Note:** Emulators don't support real NFC, but you can test the app UI.

---

### Step 4: Update Backend URL (IMPORTANT!)

Before running, you need to update the backend URL:

1. **Open these 3 files** (double-click in Project view on left):
   - `app/src/main/java/com/vinditscandit/nfctagmanager/data/ApiClient.kt`
   - `app/src/main/java/com/vinditscandit/nfctagmanager/ui/LoginActivity.kt`
   - `app/src/main/java/com/vinditscandit/nfctagmanager/ui/MainActivity.kt`

2. **Find and replace** `your-backend-url.com` with your actual backend URL

3. **Save all files** (Ctrl+S or File → Save All)

---

### Step 5: Run the App

1. **Select your device:**
   - Look at the top toolbar
   - Click the device dropdown (shows "No devices" if none selected)
   - Select your phone or emulator

2. **Click Run:**
   - Click the green ▶️ "Run" button (top toolbar)
   - Or press `Shift + F10`
   - Or: Run → Run 'app'

3. **Wait for build:**
   - Android Studio will build the app (first time takes 2-5 minutes)
   - You'll see progress at the bottom
   - When done, the app will install and launch on your device

---

### Step 6: What You Should See

**On your phone/emulator:**
1. **Login Screen** appears
2. Enter your email/username and password (from web dashboard)
3. Tap "Login"
4. **Main Screen** shows:
   - Welcome message
   - "Select Tag" button
   - "Tap NFC Tag to Write" button

---

### Step 7: Test the App

1. **Login:**
   - Use credentials from your web dashboard
   - If login fails, check backend URL is correct

2. **Select a Tag:**
   - Tap "Select Tag" button
   - Choose a tag from the list
   - Returns to main screen

3. **Write to NFC Tag (if using physical phone):**
   - Make sure NFC is enabled on your phone
   - Tap "Tap NFC Tag to Write" button
   - Hold phone near an NFC tag
   - App writes the tag's URL to the NFC tag
   - Success message appears

---

### Common Issues & Solutions

#### ❌ "No devices found"
- **Solution:** Make sure phone is connected and USB debugging is enabled
- Or create an emulator (Option B above)

#### ❌ Build fails with errors
- **Solution:** 
  - File → Invalidate Caches → Invalidate and Restart
  - Then sync again

#### ❌ "Gradle sync failed"
- **Solution:**
  - Check internet connection
  - File → Sync Project with Gradle Files
  - If still fails, check `android/build.gradle` and `android/settings.gradle` are correct

#### ❌ App crashes on launch
- **Solution:**
  - Check backend URL is updated
  - Check internet connection
  - Look at "Logcat" tab at bottom for error messages

#### ❌ Can't write to NFC tag
- **Solution:**
  - Make sure NFC is enabled (Settings → NFC)
  - Try a different NFC tag
  - Some tags are read-only

---

### Understanding Android Studio Interface

**Top Toolbar:**
- ▶️ Run button - Run the app
- 🛑 Stop button - Stop running app
- 📱 Device dropdown - Select device/emulator
- 🔄 Sync button - Sync Gradle files

**Left Side (Project View):**
- Shows all your files
- `app/src/main/java/` - Your Kotlin code
- `app/src/main/res/` - Layouts, images, strings

**Bottom Tabs:**
- **Build** - Shows build progress
- **Logcat** - Shows app logs and errors
- **Run** - Shows app output

---

### Next Steps After First Run

1. ✅ Test login with real credentials
2. ✅ Test tag selection
3. ✅ Test NFC writing (if using physical device)
4. ✅ Check that written tags open correct URL when scanned

---

### Tips for Beginners

1. **Always sync after changing Gradle files**
2. **Check Logcat for errors** - it's your best friend for debugging
3. **Use a physical device for NFC testing** - emulators don't support real NFC
4. **Build takes time first time** - be patient, it's downloading dependencies
5. **Save often** - Android Studio auto-saves, but good habit

---

### Need Help?

- **Check Logcat** - Shows what's happening
- **Check Build Output** - Shows build errors
- **Google the error message** - Usually finds solutions quickly
- **Android Studio Help** - Help → Help Topics

---

## Quick Checklist

- [ ] Project synced successfully
- [ ] Device/emulator set up
- [ ] Backend URL updated (3 files)
- [ ] App builds without errors
- [ ] App runs on device
- [ ] Login works
- [ ] Tags load
- [ ] NFC writing works (if testing NFC)

---

**You're all set!** The app should now be running on your device. 🎉
