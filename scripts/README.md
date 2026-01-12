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

### Structure des APK dans le bucket

Pour chaque environnement, deux fichiers sont créés :
1. **APK versionné** : `front-{environment}-{type}-{sha}-{timestamp}.apk`
   - Contient le SHA du commit et le timestamp pour traçabilité
2. **APK latest** : `latest.apk` (ou `latest-release.apk` pour production)
   - Pointe toujours vers la dernière version
   - Permet d'avoir un lien fixe pour télécharger la dernière version

### Liens vers les dernières versions

- **Development** : `gs://front-apk-dev/development/latest.apk`
- **Integration** : `gs://front-apk-dev/integration/latest.apk`
- **Production** : 
  - Debug : `gs://front-apk-dev/production/latest.apk`
  - Release : `gs://front-apk-dev/production/latest-release.apk`

