#!/bin/bash

# Usage: ./scripts/build-apk.sh [debug|release]

set -e

BUILD_TYPE=${1:-debug}

echo "Building Android APK (${BUILD_TYPE})..."

if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Building web application..."
npm run build

if [ ! -d "android" ]; then
    if [ ! -f "capacitor.config.json" ]; then
        echo "Initializing Capacitor..."
        npx cap init "front" "com.front.app" --web-dir=dist
    fi
    echo "Adding Android platform..."
    npx cap add android
fi

echo "Syncing Capacitor..."
if [ ! -d "android" ]; then
    echo "Error: Android platform not found after initialization"
    exit 1
fi
npx cap sync android

echo "Building Android APK..."
cd android

if [ "$BUILD_TYPE" == "release" ]; then
    ./gradlew assembleRelease
    APK_PATH="app/build/outputs/apk/release/app-release.apk"
    echo "Release APK built at: ${APK_PATH}"
else
    ./gradlew assembleDebug
    APK_PATH="app/build/outputs/apk/debug/app-debug.apk"
    echo "Debug APK built at: ${APK_PATH}"
fi

cd ..

echo "APK successfully built!"
echo "Location: android/${APK_PATH}"

