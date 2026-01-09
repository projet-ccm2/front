#!/bin/bash

# Script pour construire un APK Android localement
# Usage: ./scripts/build-apk.sh [debug|release]

set -e

BUILD_TYPE=${1:-debug}

echo "Building Android APK (${BUILD_TYPE})..."

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build l'application web
echo "Building web application..."
npm run build

# Initialiser Capacitor si nécessaire
if [ ! -d "android" ]; then
    echo "Initializing Capacitor..."
    npx cap init "front" "com.front.app" --web-dir=dist
    npx cap add android
fi

# Synchroniser Capacitor
echo "Syncing Capacitor..."
npx cap sync android

# Build l'APK
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

