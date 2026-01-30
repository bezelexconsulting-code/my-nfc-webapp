# Fix USB Installation Error

## Error: INSTALL_FAILED_USER_RESTRICTED

This means USB installation is disabled on your device for security. Here's how to enable it:

---

## For Xiaomi/MIUI Devices (Your Device)

### Step 1: Enable USB Debugging (Security)

1. Go to **Settings** → **Additional Settings** → **Developer Options**
2. Find **"USB Debugging (Security settings)"** or **"Install via USB"**
3. **Enable** it
4. You may see a warning - tap **OK** or **Allow**

### Step 2: Enable Install via USB

1. Still in **Developer Options**
2. Find **"Install via USB"** or **"USB Installation"**
3. **Enable** it
4. If prompted, tap **Allow** or **OK**

### Step 3: Disable MIUI Optimization (Sometimes Needed)

1. In **Developer Options**
2. Scroll down to find **"MIUI Optimization"**
3. **Disable** it (you'll need to restart)
4. After restart, try installing again

---

## Alternative: Install via ADB Command

If the above doesn't work, try installing directly via command line:

1. **Open Command Prompt or PowerShell** on your computer
2. Navigate to Android SDK platform-tools (usually):
   ```
   cd %LOCALAPPDATA%\Android\Sdk\platform-tools
   ```
   Or if Android Studio is installed:
   ```
   cd "C:\Users\YourUsername\AppData\Local\Android\Sdk\platform-tools"
   ```

3. **Install the APK directly:**
   ```
   adb install "C:\Users\donal\my-nfc-webapp\android\app\build\intermediates\apk\debug\app-debug.apk"
   ```

---

## Quick Checklist

- [ ] USB Debugging enabled
- [ ] USB Debugging (Security settings) enabled  
- [ ] Install via USB enabled
- [ ] USB cable connected
- [ ] Device shows "Allow USB debugging?" - tap Allow
- [ ] Device unlocked when installing

---

## Still Not Working?

### Try These:

1. **Revoke USB debugging authorizations:**
   - In Developer Options → **"Revoke USB debugging authorizations"**
   - Disconnect and reconnect USB
   - Allow when prompted

2. **Change USB connection mode:**
   - When connected, pull down notification panel
   - Tap USB notification
   - Select **"File Transfer"** or **"MTP"** mode

3. **Use Wireless ADB (Advanced):**
   - Connect via USB first
   - In Developer Options → Enable **"Wireless debugging"**
   - Connect wirelessly
   - Try installing again

4. **Check USB Cable:**
   - Try a different USB cable
   - Some cables are charge-only

---

## For Other Android Brands

### Samsung:
- Settings → Developer Options → **"USB debugging"** and **"Install via USB"**

### OnePlus/OxygenOS:
- Settings → System → Developer Options → **"USB debugging"** and **"Install via USB"**

### Stock Android:
- Settings → Developer Options → **"USB debugging"** and **"Install via USB"**

---

## After Enabling:

1. **Disconnect and reconnect** your phone
2. **Allow USB debugging** when prompted on phone
3. **Try running the app again** from Android Studio

The app should install successfully! 🎉
