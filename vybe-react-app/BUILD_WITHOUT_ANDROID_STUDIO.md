# 🚀 Build VYBE APK Without Android Studio

## Method 1: GitHub Actions (Easiest - Recommended)

### Step 1: Push to GitHub
```bash
cd /Users/rayhan/Documents/My\ Mac/Web/vybe-mern/vybe-react-app

# Initialize git (if not already done)
git init
git add .
git commit -m "Add VYBE mobile app"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/vybe-app.git
git push -u origin main
```

### Step 2: Enable GitHub Actions
1. Go to your GitHub repository
2. Click **Actions** tab
3. You'll see "Build Android APK" workflow
4. Click **Run workflow** → **Run workflow**

### Step 3: Download APK
1. Wait 5-10 minutes for build to complete
2. Click on the completed workflow run
3. Scroll down to **Artifacts**
4. Download **vybe-app-debug.zip**
5. Extract to get `app-debug.apk`

### Step 4: Install on Phone
- Transfer APK to your Android phone
- Enable "Install Unknown Apps" for your file manager
- Open APK and install

---

## Method 2: Use Expo EAS Build (Online Service)

### Setup
```bash
# Install EAS CLI
npm install -g eas-cli

# Login (create account at expo.dev if needed)
eas login

# Configure EAS
eas build:configure
```

### Build APK
```bash
# Build for Android
eas build -p android --profile preview

# Download when complete
# APK will be available in your expo.dev dashboard
```

---

## Method 3: AppCenter (Microsoft)

### Setup
1. Create account at appcenter.ms
2. Create new app for Android
3. Connect your GitHub repo

### Build
1. Go to Build section
2. Select branch (main)
3. Configure build
4. Start build
5. Download APK when complete

---

## Method 4: Local Build with Docker (Advanced)

```bash
# Pull Android build environment
docker pull mingc/android-build-box

# Build APK in container
docker run --rm -v $(pwd):/project mingc/android-build-box bash -c "cd /project && npm install && npm run build && npx cap sync android && cd android && ./gradlew assembleDebug"

# APK will be in android/app/build/outputs/apk/debug/
```

---

## Method 5: Codemagic (Free Tier Available)

### Setup
1. Go to codemagic.io
2. Sign up with GitHub
3. Add your repository

### Build
1. Select your project
2. Choose Android workflow
3. Start build
4. Download APK from artifacts

---

## Quick Comparison

| Method | Setup Time | Build Time | Cost | Difficulty |
|--------|------------|------------|------|------------|
| GitHub Actions | 5 min | 5-10 min | Free | ⭐ Easy |
| Expo EAS | 3 min | 10-15 min | Free tier | ⭐⭐ Easy |
| AppCenter | 5 min | 10-15 min | Free | ⭐⭐ Medium |
| Docker | 10 min | 10 min | Free | ⭐⭐⭐ Hard |
| Codemagic | 5 min | 8-12 min | Free tier | ⭐⭐ Easy |

---

## Recommended: GitHub Actions

**Why?**
- ✅ Completely free
- ✅ Already using Git
- ✅ Automatic on every push
- ✅ No additional accounts needed
- ✅ 30-day artifact retention

**Quick Start:**
```bash
# 1. Push to GitHub
git add .
git commit -m "Ready for mobile build"
git push

# 2. Go to GitHub → Actions → Run workflow
# 3. Download APK from Artifacts
```

---

## Troubleshooting

### GitHub Actions fails
- Check the Actions log for errors
- Make sure all files are committed
- Verify .github/workflows/build-android.yml exists

### "Artifact not found"
- Wait for build to complete (green checkmark)
- Refresh the page
- Check Artifacts section at bottom

### APK won't install on phone
- Enable "Install Unknown Apps" in Settings
- Check if phone allows installations from Downloads
- Try different file manager app

---

## Current Setup Status

✅ GitHub Actions workflow created at `.github/workflows/build-android.yml`
✅ Web app built and synced
✅ Android project ready

**Next Step:** Push to GitHub and run the workflow!

```bash
# Quick push to GitHub
git init
git add .
git commit -m "Add VYBE mobile app with GitHub Actions"
# Then create repo on GitHub and push
```
