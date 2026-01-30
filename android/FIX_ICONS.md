# Fix App Icons - Quick Guide

## The Problem
The build is failing because app launcher icons are missing.

## Quick Fix (2 minutes):

### Option 1: Generate Icons in Android Studio (Recommended)

1. In Android Studio, right-click on `app/src/main/res` folder
2. Select **New → Image Asset**
3. In the dialog:
   - **Icon Type**: Launcher Icons (Adaptive and Legacy)
   - **Foreground Layer**: 
     - Choose an image, OR
     - Click "Clip Art" and select an icon, OR
     - Use text "NFC" with a background color
   - **Background Layer**: Choose a color (e.g., blue)
4. Click **Next** → **Finish**
5. This will create icons in all mipmap folders automatically
6. **Rebuild** the project

### Option 2: Use Default Android Icon (Temporary)

I've temporarily set the manifest to use a default Android icon. This will let you build, but you should replace it with proper icons before publishing.

To add proper icons later:
- Follow Option 1 above
- Then update AndroidManifest.xml to use `@mipmap/ic_launcher` again

### Option 3: Download and Add Icons Manually

1. Create a 512x512 PNG icon
2. Use an online tool like https://icon.kitchen/ to generate all sizes
3. Place icons in:
   - `mipmap-mdpi/ic_launcher.png` (48x48)
   - `mipmap-hdpi/ic_launcher.png` (72x72)
   - `mipmap-xhdpi/ic_launcher.png` (96x96)
   - `mipmap-xxhdpi/ic_launcher.png` (144x144)
   - `mipmap-xxxhdpi/ic_launcher.png` (192x192)
4. Also create `ic_launcher_round` versions (same sizes)

## After Adding Icons:

1. Update AndroidManifest.xml back to:
   ```xml
   android:icon="@mipmap/ic_launcher"
   android:roundIcon="@mipmap/ic_launcher_round"
   ```
2. Remove the `tools:replace` line
3. Rebuild

## For Now:

The manifest has been updated to use a temporary default icon so you can build immediately. You can add proper icons later!
