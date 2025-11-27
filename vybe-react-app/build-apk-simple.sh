#!/bin/bash

# Simple APK Builder - No Android Studio Required
# Uses Docker to build your APK

echo "🚀 VYBE APK Builder"
echo "=================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Installing Docker..."
    echo ""
    echo "Please install Docker Desktop from:"
    echo "https://www.docker.com/products/docker-desktop/"
    echo ""
    echo "After installing Docker, run this script again."
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker is not running."
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is ready"
echo ""

# Build the web app first
echo "📦 Building web app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed"
    exit 1
fi

echo "✅ Web build complete"
echo ""

# Sync Capacitor
echo "🔄 Syncing Capacitor..."
npx cap sync android

if [ $? -ne 0 ]; then
    echo "❌ Capacitor sync failed"
    exit 1
fi

echo "✅ Capacitor synced"
echo ""

# Build APK using Docker
echo "🏗️  Building APK in Docker..."
echo "(This may take 5-10 minutes on first run)"
echo ""

docker run --rm \
  -v "$(pwd)/android":/project \
  -w /project \
  mingc/android-build-box:latest \
  bash -c "chmod +x ./gradlew && ./gradlew assembleDebug"

if [ $? -ne 0 ]; then
    echo "❌ APK build failed"
    exit 1
fi

# Check if APK was created
APK_PATH="android/app/build/outputs/apk/debug/app-debug.apk"

if [ -f "$APK_PATH" ]; then
    echo ""
    echo "✅ SUCCESS! APK built successfully!"
    echo ""
    echo "📱 Your APK is ready at:"
    echo "   $APK_PATH"
    echo ""
    echo "📂 Opening folder..."
    open "android/app/build/outputs/apk/debug"
    echo ""
    echo "🎉 Transfer this file to your Android phone and install it!"
else
    echo "❌ APK file not found at expected location"
    exit 1
fi
