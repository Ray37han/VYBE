# VYBE - Quick Deployment Guide

## 🎯 Platform-Specific Instructions

### 📱 Install on Android Phone (No Computer Needed)

#### Option A: Direct APK Install
1. Download `app-debug.apk` to your Android phone
2. Open the APK file
3. If prompted, enable "Install from Unknown Sources"
4. Tap "Install"
5. Done! Open VYBE app

#### Option B: Build APK on Computer
```bash
# On your computer
npm run build
cd android && ./gradlew assembleDebug

# APK location: android/app/build/outputs/apk/debug/app-debug.apk
# Transfer to phone via USB, email, or cloud storage
```

### 🍎 Install on iPhone (Mac Required)

```bash
# 1. Build the app
npm run build
npx cap sync ios

# 2. Open in Xcode
npm run ios

# 3. Connect your iPhone
# 4. Select your iPhone as target
# 5. Click Run button (or ⌘R)
```

**Note:** You need an Apple Developer account ($99/year) to install on physical devices.

### 🌐 Deploy Website

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Build
npm run build

# Drag and drop the 'dist' folder to Netlify
# Or use Netlify CLI
```

#### Manual Hosting
```bash
npm run build
# Upload 'dist' folder to any web hosting service
```

---

## 📋 Pre-Deployment Checklist

- [ ] Update `.env` with production API URL
- [ ] Test all features (cart, checkout, login)
- [ ] Verify images load correctly
- [ ] Test on different screen sizes
- [ ] Check mobile responsiveness
- [ ] Test network error handling
- [ ] Update version number
- [ ] Generate app icons
- [ ] Test on real devices

---

## 🚀 One-Command Builds

### Build Everything
```bash
npm run build:mobile
```

### Android APK Only
```bash
./build-android-apk.sh
```

### Web Only
```bash
npm run build
```

---

## 📦 Distribution

### Share APK File
1. Build APK: `cd android && ./gradlew assembleDebug`
2. Find APK: `android/app/build/outputs/apk/debug/app-debug.apk`
3. Share via:
   - Google Drive
   - Dropbox
   - Email
   - WhatsApp
   - USB transfer

### Upload to Stores

**Google Play Store:**
- Requires Google Play Developer account ($25 one-time)
- Build release APK/AAB
- Upload to Play Console
- Review takes 1-7 days

**Apple App Store:**
- Requires Apple Developer account ($99/year)
- Archive in Xcode
- Upload to App Store Connect
- Review takes 1-3 days

---

## 🔑 Environment Variables

Create `.env` file:
```bash
VITE_API_URL=https://vybe-backend-93eu.onrender.com/api
```

For production, update with your backend URL.

---

## 💡 Quick Tips

**Testing on Android:**
- Enable Developer Options
- Enable USB Debugging
- Use `adb devices` to check connection

**Testing on iOS:**
- Trust Developer Certificate (Settings → General → VPN & Device Management)
- Keep phone unlocked during install

**Faster Builds:**
```bash
# Skip Android build, just sync
npx cap sync android --no-build
```

**Clear Cache:**
```bash
# Web
rm -rf node_modules dist .vite
npm install

# Android
cd android && ./gradlew clean
```

---

## 🛠️ Common Issues

**APK won't install:**
- Enable "Install Unknown Apps" for your browser/file manager
- Settings → Apps → Special Access → Install Unknown Apps

**App crashes on startup:**
- Check API URL in `.env`
- Rebuild: `npm run build && npx cap sync`

**White screen:**
- Clear app data
- Reinstall the app
- Check network connection

**Build errors:**
- Run `npm install` again
- Check Java/Android SDK versions
- Update Android Studio

---

## 📞 Need Help?

See [INSTALLATION.md](./INSTALLATION.md) for detailed instructions.

---

**Current Version:** 1.0.0  
**App ID:** com.vybe.app  
**Backend:** https://vybe-backend-93eu.onrender.com/api
