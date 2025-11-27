# VYBE App - Installation & Deployment Guide

## 📱 Overview

VYBE is a cross-platform e-commerce application built with React and Capacitor, available for:
- **Web** (Progressive Web App)
- **Android** (APK/AAB)
- **iOS** (IPA)

---

## 🚀 Quick Start

### Prerequisites

**For All Platforms:**
- Node.js 16+ and npm
- Git

**For Android:**
- Android Studio (latest version)
- Java JDK 11 or higher
- Android SDK (API 33+)

**For iOS (Mac only):**
- Xcode 14+
- CocoaPods
- macOS 12+

---

## 🌐 Web Deployment

### Development Mode
```bash
npm install
npm run dev
```
Opens at `http://localhost:3001`

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Vercel/Netlify
```bash
# Build the app
npm run build

# Deploy dist/ folder to your hosting service
```

**Environment Variables:**
Create `.env` file:
```
VITE_API_URL=https://vybe-backend-93eu.onrender.com/api
```

---

## 🤖 Android Deployment

### Option 1: Build APK (Easiest)

#### Step 1: Build the app
```bash
npm run build
npx cap sync android
```

#### Step 2: Generate APK
```bash
cd android
./gradlew assembleDebug
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

#### Step 3: Install on Device
```bash
# Via USB (enable USB debugging on your phone)
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or share the APK file directly
```

### Option 2: Android Studio (Recommended)

#### Step 1: Build and sync
```bash
npm run build:mobile
# OR
./build-mobile.sh
```

#### Step 2: Open in Android Studio
```bash
npm run android
# OR
npx cap open android
```

#### Step 3: Build in Android Studio
1. Wait for Gradle sync to complete
2. Click **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
3. APK will be generated in `android/app/build/outputs/apk/`

### Option 3: Automated Script
```bash
./build-android-apk.sh
```

### Production Build (Release APK)

#### Step 1: Generate signing key
```bash
keytool -genkey -v -keystore vybe-release.keystore -alias vybe -keyalg RSA -keysize 2048 -validity 10000
```

#### Step 2: Update gradle.properties
Add to `android/gradle.properties`:
```
VYBE_RELEASE_STORE_FILE=../vybe-release.keystore
VYBE_RELEASE_KEY_ALIAS=vybe
VYBE_RELEASE_STORE_PASSWORD=your_password
VYBE_RELEASE_KEY_PASSWORD=your_password
```

#### Step 3: Update build.gradle
Add to `android/app/build.gradle`:
```gradle
android {
    signingConfigs {
        release {
            storeFile file(System.getenv("VYBE_RELEASE_STORE_FILE") ?: project.property("VYBE_RELEASE_STORE_FILE"))
            keyAlias System.getenv("VYBE_RELEASE_KEY_ALIAS") ?: project.property("VYBE_RELEASE_KEY_ALIAS")
            storePassword System.getenv("VYBE_RELEASE_STORE_PASSWORD") ?: project.property("VYBE_RELEASE_STORE_PASSWORD")
            keyPassword System.getenv("VYBE_RELEASE_KEY_PASSWORD") ?: project.property("VYBE_RELEASE_KEY_PASSWORD")
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

#### Step 4: Build release APK
```bash
cd android
./gradlew assembleRelease
```

**Output:** `android/app/build/outputs/apk/release/app-release.apk`

---

## 🍎 iOS Deployment (Mac Only)

### Step 1: Install CocoaPods
```bash
sudo gem install cocoapods
```

### Step 2: Build and sync
```bash
npm run build
npx cap sync ios
```

### Step 3: Install pods
```bash
cd ios/App
pod install
```

### Step 4: Open in Xcode
```bash
npm run ios
# OR
npx cap open ios
```

### Step 5: Build in Xcode
1. Select your development team in **Signing & Capabilities**
2. Choose target device/simulator
3. Click **Product** → **Build** or press `⌘B`
4. To run: **Product** → **Run** or press `⌘R`

### Production Build (App Store)

#### Step 1: Update version
Update in `ios/App/App.xcodeproj/project.pbxproj`:
- Version: 1.0.0
- Build: 1

#### Step 2: Archive
1. Select **Any iOS Device** as target
2. **Product** → **Archive**
3. Wait for archive to complete

#### Step 3: Upload to App Store
1. Click **Distribute App**
2. Choose **App Store Connect**
3. Follow the wizard

---

## �� App Configuration

### Update App Name & Bundle ID

**Capacitor Config** (`capacitor.config.ts`):
```typescript
const config: CapacitorConfig = {
  appId: 'com.vybe.app',
  appName: 'VYBE',
  webDir: 'dist',
}
```

**Android** (`android/app/build.gradle`):
```gradle
defaultConfig {
    applicationId "com.vybe.app"
    versionCode 1
    versionName "1.0.0"
}
```

**iOS** (Update in Xcode):
- Bundle Identifier: `com.vybe.app`
- Display Name: `VYBE`

### Update App Icons

Place icons in:
- **Android:** `android/app/src/main/res/mipmap-*/ic_launcher.png`
- **iOS:** Use Xcode Asset Catalog

Or use icon generator:
```bash
npm install -g @capacitor/assets
npx capacitor-assets generate --iconBackgroundColor '#0f172a'
```

---

## 📦 Publishing

### Google Play Store

1. **Create App:** Go to [Google Play Console](https://play.google.com/console)
2. **Upload AAB:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```
   Upload: `android/app/build/outputs/bundle/release/app-release.aab`
3. **Fill Details:** Screenshots, description, privacy policy
4. **Submit for Review**

### Apple App Store

1. **Create App:** Go to [App Store Connect](https://appstoreconnect.apple.com)
2. **Upload Build:** Use Xcode Archive → Distribute
3. **Fill Details:** Screenshots, description, privacy policy
4. **Submit for Review**

---

## 🔧 Troubleshooting

### Android Build Issues

**Gradle sync failed:**
```bash
cd android
./gradlew clean
./gradlew build --refresh-dependencies
```

**SDK not found:**
- Open Android Studio
- Go to **Tools** → **SDK Manager**
- Install required SDK versions

### iOS Build Issues

**Pods not installed:**
```bash
cd ios/App
pod deintegrate
pod install
```

**Code signing error:**
- Open project in Xcode
- Select target → **Signing & Capabilities**
- Choose your Apple Developer account

### Common Issues

**White screen on mobile:**
- Check console for errors
- Verify API URL in `.env`
- Run `npx cap sync` after build changes

**App not updating:**
```bash
npm run build
npx cap sync
# Then rebuild in IDE
```

---

## 📞 Support

- **Backend API:** https://vybe-backend-93eu.onrender.com/api
- **App ID:** com.vybe.app
- **Version:** 1.0.0

---

## 📝 Development Commands Reference

```bash
# Web Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Mobile Development
npm run build:mobile     # Build and sync all platforms
npm run sync             # Sync web assets to mobile
npm run android          # Open Android Studio
npm run ios              # Open Xcode
npm run run:android      # Run on Android device
npm run run:ios          # Run on iOS device/simulator

# Build Scripts
./build-mobile.sh        # Interactive build for all platforms
./build-android-apk.sh   # Build Android APK directly
```

---

**Built with ❤️ using React, Vite, Tailwind CSS, and Capacitor**
