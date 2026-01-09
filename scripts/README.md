# Scripts de build Android

## Build APK localement

Pour construire un APK Android localement, utilisez le script `build-apk.sh` :

```bash
# Build APK Debug (par défaut)
./scripts/build-apk.sh debug

# Build APK Release
./scripts/build-apk.sh release
```

### Prérequis

- Node.js 20+
- Java JDK 17+
- Android SDK (installé via Android Studio ou manuellement)
- Variables d'environnement Android configurées :
  - `ANDROID_HOME` : chemin vers le SDK Android
  - `JAVA_HOME` : chemin vers le JDK

### Pour tester avec Android Studio

1. Build l'APK debug :
   ```bash
   npm run android:apk
   ```

2. Ouvrir le projet Android dans Android Studio :
   ```bash
   npm run android:open
   ```

3. Dans Android Studio, vous pouvez :
   - Exécuter l'app sur un émulateur ou un appareil connecté
   - Build et signer l'APK
   - Debugger l'application

## Workflow GitHub Actions

Le workflow `.github/workflows/build-android-apk.yml` génère automatiquement les APK lors des push sur :
- `develop` → APK debug dans le bucket `front-apk-dev/development/`
- `main` → APK debug dans le bucket `front-apk-dev/integration/`
- Tags `v*` → APK debug et release dans le bucket `front-apk-dev/production/`

Les APK sont nommés avec le format : `front-{environment}-{type}-{sha}-{timestamp}.apk`

