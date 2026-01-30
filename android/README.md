# NFC Tag Manager - Android App

Simple Android app for writing NFC tags. Just tap to write your tag profile URL to an NFC tag.

## Features

- ✅ Login with email/username and password
- ✅ View your tags from the web dashboard
- ✅ Select a tag profile to write
- ✅ Write tag URL to NFC tags
- ✅ Simple, clean Material Design 3 UI
- ✅ Offline credential storage

## Setup Instructions

### 1. Update Backend URL

Edit `app/src/main/java/com/vinditscandit/nfctagmanager/data/ApiClient.kt`:

```kotlin
private const val BASE_URL = "https://your-backend-url.com/api/"
```

Replace `your-backend-url.com` with your actual backend URL.

### 2. Update Registration Link

Edit `app/src/main/java/com/vinditscandit/nfctagmanager/ui/LoginActivity.kt`:

```kotlin
intent.data = android.net.Uri.parse("https://your-backend-url.com/register")
```

### 3. Update Tag URL Base

Edit `app/src/main/java/com/vinditscandit/nfctagmanager/ui/MainActivity.kt`:

```kotlin
val baseUrl = "https://your-backend-url.com"
```

### 4. Build and Run

```bash
cd android
./gradlew assembleDebug
```

Or open in Android Studio and run.

## Requirements

- Android SDK 24+ (Android 7.0+)
- NFC-enabled device
- Internet connection for API calls

## How It Works

1. **Login**: User logs in with credentials from web dashboard
2. **Select Tag**: User selects which tag profile to write
3. **Tap NFC Tag**: User taps an NFC tag with their phone
4. **Write**: App writes the tag's public URL to the NFC tag
5. **Done**: When someone scans the tag, they go to the tag's public page

## Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/vinditscandit/nfctagmanager/
│   │   │   ├── data/          # API client and models
│   │   │   ├── nfc/           # NFC reading/writing logic
│   │   │   ├── ui/             # Activities
│   │   │   ├── utils/          # Utilities (PreferencesManager)
│   │   │   └── viewmodel/      # ViewModels
│   │   └── res/                # Resources (layouts, strings, etc.)
│   └── build.gradle
├── build.gradle
└── settings.gradle
```

## NFC Writing

The app writes a URL in NDEF format to NFC tags. The URL format is:
```
https://your-backend-url.com/public-tag/{slug}
```

When someone scans the tag, their phone will open this URL in a browser.

## Security Notes

- Credentials are stored in SharedPreferences (not encrypted by default)
- Consider using EncryptedSharedPreferences for production
- API calls use HTTPS (make sure your backend supports HTTPS)

## Future Enhancements

- Biometric authentication
- Encrypted credential storage
- Tag inventory management
- Batch writing
- Write verification
- Tag type detection

## License

Same as main project.
