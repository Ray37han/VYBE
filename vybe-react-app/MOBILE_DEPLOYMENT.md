# 📱 VYBE Mobile App Deployment Guide

## 🎉 Mobile App Setup Complete!

Your VYBE e-commerce app is now ready to be deployed on **Android** and **iOS**!

---

## 📦 What's Been Set Up

### ✅ Capacitor Configuration
- **App Name**: VYBE
- **Bundle ID**: com.vybe.app
- **Platforms**: iOS & Android
- **Build Output**: `dist/` folder

### ✅ Installed Plugins
- `@capacitor/app` - App lifecycle management
- `@capacitor/splash-screen` - Custom splash screen
- `@capacitor/status-bar` - Status bar styling
- `@capacitor/keyboard` - Keyboard behavior control

### ✅ Mobile Optimizations
- Responsive design with Aurora Glass theme
- Mobile-friendly viewport configuration
- Dark theme status bar (#0f172a)
- Touch-optimized UI components

---

## 🚀 Building for Production

### 1. Web Build
```bash
npm run build
```

### 2. Sync with Mobile Platforms
```bash
npx cap sync
```

This command:
- Copies web build to native projects
- Updates native dependencies
- Syncs plugin configurations

---

## 📱 Android Deployment

### Prerequisites
- **Android Studio** (download from https://developer.android.com/studio)
- **Java Development Kit (JDK)** 17 or higher

### Steps to Release Android App

#### 1. Open Project in Android Studio
```bash
npx cap open android
```

#### 2. Configure Signing
1. In Android Studio, go to **Build** → **Generate Signed Bundle / APK**
2. Create a new keystore or use existing one
3. Fill in keystore details:
   - **Keystore path**: `/path/to/vybe-keystore.jks`
   - **Password**: [your password]
   - **Alias**: vybe-key
   - **Key password**: [your password]

#### 3. Build APK or AAB
- **APK** (for direct installation): Build → Build Bundle(s) / APK(s) → Build APK(s)
- **AAB** (for Play Store): Build → Generate Signed Bundle / APK → Android App Bundle

#### 4. Publish to Google Play Store
1. Go to [Google Play Console](https://play.google.com/console)
2. Create a new application
3. Upload the AAB file
4. Fill in app details:
   - Title: VYBE
   - Description: Elevate Your Living Space with Premium Wall Art
   - Category: Shopping
   - Screenshots: Add product screenshots
5. Set up pricing (Free with in-app purchases)
6. Submit for review

### Testing Android App
```bash
# Build and run on connected device
npx cap run android

# Or open in Android Studio and click Run
npx cap open android
```

---

## 🍎 iOS Deployment

### Prerequisites
- **macOS** (required for iOS development)
- **Xcode** (download from Mac App Store)
- **Apple Developer Account** ($99/year)
- **CocoaPods** (install: `sudo gem install cocoapods`)

### Steps to Release iOS App

#### 1. Install iOS Dependencies
```bash
cd ios/App
pod install
cd ../..
```

#### 2. Open Project in Xcode
```bash
npx cap open ios
```

#### 3. Configure Signing
1. In Xcode, select the **App** target
2. Go to **Signing & Capabilities**
3. Select your **Team** (Apple Developer Account)
4. Xcode will automatically create provisioning profiles

#### 4. Update Bundle Identifier
- Ensure Bundle ID is: `com.vybe.app`
- Or change to your custom domain: `com.yourcompany.vybe`

#### 5. Build for Release
1. In Xcode, select **Any iOS Device (arm64)**
2. Go to **Product** → **Archive**
3. Wait for archive to complete
4. Click **Distribute App**
5. Choose **App Store Connect**
6. Follow the upload wizard

#### 6. Publish to App Store
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Create a new app
3. Fill in app details:
   - Name: VYBE
   - Bundle ID: com.vybe.app
   - Primary Category: Shopping
   - Screenshots: Add 6.5" and 5.5" screenshots
4. Submit for review

### Testing iOS App
```bash
# Run on iOS Simulator
npx cap run ios

# Or open in Xcode and click Run
npx cap open ios
```

---

## 🔄 Update Workflow

When you make changes to your React app:

```bash
# 1. Update your code in src/
# 2. Build the web app
npm run build

# 3. Sync with mobile platforms
npx cap sync

# 4. Test on devices
npx cap run android
npx cap run ios
```

---

## 🎨 App Icons & Splash Screens

### Generate App Icons
1. Create a 1024x1024 PNG icon
2. Use online tool: https://appicon.co or https://www.appicon.build
3. Place generated icons in:
   - Android: `android/app/src/main/res/`
   - iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

### Create Splash Screens
1. Create splash screen designs (various sizes)
2. Use: https://apetools.webprofusion.com/#/tools/imagegorilla
3. Or use `@capacitor/assets`:
```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
```

**Recommended Splash Screen**:
- Background: #0f172a (dark slate)
- Logo: VYBE gradient text with animated orbs
- Size: 2732x2732 PNG

---

## 🌐 Deploy Web Version (Bonus)

Your app can also be deployed as a PWA:

### Deploy to Vercel
```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment Variables
Make sure to set in production:
```
VITE_API_URL=https://vybe-backend-93eu.onrender.com/api
```

---

## 📊 App Store Optimization (ASO)

### App Title
**VYBE - Premium Wall Art & Motivational Posters**

### Short Description
Transform your space with stunning wall art and motivational posters.

### Full Description
```
VYBE brings you premium quality wall art and motivational posters to elevate your living space. Browse our curated collection of:

✨ Football Motivational Posters
🎨 Modern Wall Art
🕌 Islamic Calligraphy
🏎️ Sports & Cars Collection

Features:
• Beautiful Aurora Glass UI
• Secure checkout with multiple payment methods
• Order tracking
• Fast delivery across Bangladesh
• Easy returns

Download VYBE today and transform your walls!
```

### Keywords
- wall art
- posters
- motivational posters
- home decor
- wall decor
- islamic art
- football posters
- wall prints

### Screenshots Needed
1. Home screen with animated orbs
2. Product listing page
3. Product detail page
4. Shopping cart
5. Checkout screen
6. Order history

---

## 🔐 Security Checklist

- [ ] Remove console.log statements in production
- [ ] Enable HTTPS-only in production
- [ ] Add proper error handling
- [ ] Implement rate limiting on API
- [ ] Add authentication token refresh
- [ ] Enable ProGuard/R8 (Android obfuscation)
- [ ] Enable bitcode (iOS optimization)

---

## 📱 App Store Links (After Publishing)

**Google Play Store**:
```
https://play.google.com/store/apps/details?id=com.vybe.app
```

**Apple App Store**:
```
https://apps.apple.com/app/vybe/id[YOUR_APP_ID]
```

---

## 🆘 Troubleshooting

### Android Build Fails
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npx cap sync android
```

### iOS Pod Install Fails
```bash
cd ios/App
pod repo update
pod install
cd ../..
```

### Capacitor Sync Issues
```bash
# Clear cache and rebuild
rm -rf dist
npm run build
npx cap sync
```

---

## 📞 Support

For issues or questions:
- GitHub: [Create an issue]
- Email: support@vybe.com
- Backend API: https://vybe-backend-93eu.onrender.com/api

---

## 🎊 Next Steps

1. ✅ Test app on real Android device
2. ✅ Test app on iPhone/iPad (if available)
3. ✅ Create app icons and splash screens
4. ✅ Take screenshots for app stores
5. ✅ Set up Google Play Developer Account ($25 one-time)
6. ✅ Set up Apple Developer Account ($99/year)
7. ✅ Submit app for review
8. ✅ Monitor reviews and update regularly

**Congratulations! Your VYBE mobile app is ready to launch! 🚀**
