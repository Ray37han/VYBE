# 📱 Build Android APK - Complete Guide

## Option 1: Use Android Studio (Recommended - Easiest)

### Step 1: Install Android Studio
1. Download from: https://developer.android.com/studio
2. Install and open Android Studio
3. Complete the setup wizard (it will download SDK automatically)

### Step 2: Open Project in Android Studio
```bash
cd /Users/rayhan/Documents/My\ Mac/Web/vybe-mern/vybe-react-app
npx cap open android
```

### Step 3: Build APK in Android Studio
1. Wait for Gradle sync to complete (bottom status bar)
2. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. Wait for build to complete
4. Click "locate" in the notification or find APK at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 4: Transfer to Your Phone
- Connect phone via USB and copy file
- Or upload to Google Drive and download on phone
- Or email it to yourself

---

## Option 2: Command Line (After Installing Android Studio)

### Step 1: Install Android Studio
- Download and install from: https://developer.android.com/studio
- Open it once to install SDK

### Step 2: Build APK
```bash
cd /Users/rayhan/Documents/My\ Mac/Web/vybe-mern/vybe-react-app

# Build web app
npm run build

# Sync to Android
npx cap sync android

# Build APK (Android Studio must be installed first)
cd android
JAVA_HOME=/Applications/WebStorm.app/Contents/jbr/Contents/Home ./gradlew assembleDebug
```

### Step 3: Find Your APK
```bash
# APK location:
android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Option 3: Use Online Build Service (No Android Studio Needed)

### EAS Build (Expo Application Services)
```bash
# Install EAS CLI
npm install -g eas-cli

# Create account at expo.dev
eas login

# Build APK in cloud
eas build -p android --profile preview
```

---

## Installing APK on Your Android Phone

### Step 1: Transfer APK to Phone
- USB cable
- Google Drive / Dropbox
- Email
- Direct download from web

### Step 2: Enable Installation
1. Open **Settings**
2. Go to **Security** or **Apps**
3. Find **Install Unknown Apps**
4. Enable for your **File Manager** or **Browser**

### Step 3: Install
1. Open the APK file on your phone
2. Tap **Install**
3. Wait for installation
4. Tap **Open** to launch VYBE app!

---

## Quick Status Check

Run this to see what you need:
```bash
# Check Java
java -version

# Check Android SDK
ls ~/Library/Android/sdk && echo "SDK found" || echo "SDK not found - install Android Studio"

# Check build tools
which gradle && echo "Gradle found" || echo "Gradle found in project"
```

---

## Troubleshooting

**"SDK location not found"**
- Install Android Studio
- Or create `android/local.properties`:
  ```
  sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
  ```

**"Java version error"**
- Use Java 17 or 21 (comes with Android Studio)
- Or: `export JAVA_HOME=/Applications/WebStorm.app/Contents/jbr/Contents/Home`

**"Build failed"**
- Clean and rebuild:
  ```bash
  cd android
  ./gradlew clean
  ./gradlew assembleDebug
  ```

---

## Current Status

✅ Web app built successfully
✅ Android project synced
❌ Android SDK needed to build APK

**Next Step:** Install Android Studio, then open project with:
```bash
npx cap open android
```

Then build APK using the GUI (much easier than command line).
