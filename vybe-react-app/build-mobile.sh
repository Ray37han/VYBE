#!/bin/bash

echo "🚀 Building VYBE Mobile App..."
echo ""

# Build web app
echo "📦 Building web assets..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Web build failed!"
    exit 1
fi

echo "✅ Web build complete!"
echo ""

# Sync with mobile platforms
echo "🔄 Syncing with mobile platforms..."
npx cap sync

echo ""
echo "✅ Mobile sync complete!"
echo ""
echo "📱 Next steps:"
echo ""
echo "For Android:"
echo "  npm run android    - Open in Android Studio"
echo "  OR"
echo "  cd android && ./gradlew assembleDebug"
echo "  APK will be in: android/app/build/outputs/apk/debug/"
echo ""
echo "For iOS (Mac only):"
echo "  npm run ios        - Open in Xcode"
echo ""
