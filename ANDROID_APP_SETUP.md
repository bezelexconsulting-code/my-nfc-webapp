# Android App Setup Guide

## Quick Start

The Android app is a simple "tap to write" NFC tag manager. Here's how to set it up:

## 1. Prerequisites

- Android Studio (latest version)
- Android SDK 24+ (Android 7.0+)
- NFC-enabled Android device for testing
- Your backend API running and accessible

## 2. Configuration Steps

### Step 1: Update Backend URL

You need to update the backend URL in **3 places**:

**File 1**: `android/app/src/main/java/com/vinditscandit/nfctagmanager/data/ApiClient.kt`
```kotlin
private const val BASE_URL = "https://your-backend-url.com/api/"
```

**File 2**: `android/app/src/main/java/com/vinditscandit/nfctagmanager/ui/LoginActivity.kt`
```kotlin
intent.data = android.net.Uri.parse("https://your-backend-url.com/register")
```

**File 3**: `android/app/src/main/java/com/vinditscandit/nfctagmanager/ui/MainActivity.kt`
```kotlin
val baseUrl = "https://your-backend-url.com"
```

Replace `your-backend-url.com` with your actual backend URL in all three places.

### Step 2: Open in Android Studio

1. Open Android Studio
2. File → Open → Select the `android` folder
3. Wait for Gradle sync to complete

### Step 3: Build and Run

1. Connect your NFC-enabled Android device or start an emulator (with NFC support)
2. Click Run (green play button) or press `Shift+F10`
3. The app will install and launch

## 3. How to Use

1. **Login**: 
   - Enter your email/username and password (same as web dashboard)
   - Tap "Login"

2. **Select Tag**:
   - Tap "Select Tag" button
   - Choose which tag profile you want to write
   - Returns to main screen

3. **Write to NFC Tag**:
   - Make sure NFC is enabled on your device
   - Tap "Tap NFC Tag to Write" button (or just tap an NFC tag)
   - Hold your phone near the NFC tag
   - App writes the tag's URL to the NFC tag
   - Success message appears

4. **Test**:
   - Scan the written tag with another phone
   - Should open the tag's public page

## 4. Features

✅ **Simple UI**: Clean Material Design 3 interface  
✅ **NFC Writing**: Write URLs to NFC tags  
✅ **Tag Selection**: Choose which tag profile to write  
✅ **Login**: Secure authentication  
✅ **Offline Storage**: Credentials saved locally  

## 5. Troubleshooting

### NFC Not Working
- Make sure NFC is enabled in device settings
- Check that your device supports NFC
- Try tapping the tag more slowly
- Some tags may be read-only

### Login Fails
- Check your backend URL is correct
- Verify backend API is running
- Check network connection
- Verify credentials are correct

### Can't Write to Tag
- Tag may be read-only or locked
- Tag may not support NDEF format
- Try a different NFC tag
- Check tag has enough space

### Build Errors
- Make sure Android SDK is installed
- Sync Gradle files (File → Sync Project with Gradle Files)
- Clean and rebuild (Build → Clean Project, then Build → Rebuild Project)

## 6. Testing Checklist

- [ ] App installs successfully
- [ ] Login works with valid credentials
- [ ] Tags load from backend
- [ ] Tag selection works
- [ ] NFC writing works
- [ ] Written tag opens correct URL when scanned
- [ ] Logout works
- [ ] App handles errors gracefully

## 7. Production Considerations

Before publishing to Play Store:

1. **Security**:
   - Use EncryptedSharedPreferences for credentials
   - Add certificate pinning for API calls
   - Implement proper error handling

2. **Performance**:
   - Add loading states
   - Optimize API calls
   - Cache tag data

3. **UX**:
   - Add haptic feedback
   - Improve error messages
   - Add success animations

4. **Testing**:
   - Test on multiple devices
   - Test with different NFC tag types
   - Test offline scenarios

## 8. File Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml      # App permissions and activities
│   │   ├── java/.../
│   │   │   ├── data/
│   │   │   │   ├── ApiClient.kt     # Retrofit setup
│   │   │   │   └── ApiService.kt     # API endpoints
│   │   │   ├── nfc/
│   │   │   │   └── NfcManager.kt    # NFC reading/writing
│   │   │   ├── ui/
│   │   │   │   ├── LoginActivity.kt  # Login screen
│   │   │   │   ├── MainActivity.kt   # Main screen
│   │   │   │   └── TagSelectionActivity.kt  # Tag selection
│   │   │   ├── utils/
│   │   │   │   └── PreferencesManager.kt  # Local storage
│   │   │   └── viewmodel/            # ViewModels
│   │   └── res/                      # Layouts, strings, etc.
│   └── build.gradle                  # App dependencies
├── build.gradle                      # Project config
└── settings.gradle                   # Project settings
```

## 9. Next Steps

After basic setup works:
1. Add biometric authentication
2. Improve error handling
3. Add tag inventory management
4. Add batch writing
5. Add write verification

## Support

If you encounter issues:
1. Check Android Studio logs
2. Check device logs: `adb logcat`
3. Verify backend API is accessible
4. Test NFC with another app first
