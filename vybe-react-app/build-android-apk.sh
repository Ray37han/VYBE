#!/bin/bash

echo "🤖 Building Android APK..."
echo ""

# Build web app
echo "📦 Building web assets..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed!"
    exit 1
fi

# Sync with Android
echo "🔄 Syncing with Android..."
npx cap sync android

# Build APK
echo "🔨 Building APK..."
cd android && ./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ APK built successfully!"
    echo ""
    echo "📍 Location: android/app/build/outputs/apk/debug/app-debug.apk"
    echo ""
    echo "To install on device:"
    echo "  adb install android/app/build/outputs/apk/debug/app-debug.apk"
else
    echo "❌ APK build failed!"
    exit 1
fi
