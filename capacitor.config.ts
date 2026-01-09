import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.front.app',
  appName: 'front',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      keystorePath: process.env.ANDROID_KEYSTORE_PATH || undefined,
      keystorePassword: process.env.ANDROID_KEYSTORE_PASSWORD || undefined,
      keystoreAlias: process.env.ANDROID_KEYSTORE_ALIAS || undefined,
      keystoreAliasPassword: process.env.ANDROID_KEYSTORE_ALIAS_PASSWORD || undefined,
    },
  },
}

export default config

