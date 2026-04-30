#!/usr/bin/env node
// Patches android/app/src/main/AndroidManifest.xml to add a deep-link intent-filter
// for the OAuth callback (com.streamquest.app:// scheme).
// Idempotent: skips if the filter is already present.

import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const MANIFEST = 'android/app/src/main/AndroidManifest.xml'
const SCHEME = 'com.streamquest.app'

if (!existsSync(MANIFEST)) {
  console.error(`[patch-android-manifest] ${MANIFEST} not found — did 'npx cap add android' run?`)
  process.exit(1)
}

let xml = readFileSync(MANIFEST, 'utf8')

if (xml.includes(`android:scheme="${SCHEME}"`)) {
  console.log('[patch-android-manifest] intent-filter already present — skipping')
  console.log('--- AndroidManifest.xml (current) ---')
  console.log(xml)
  process.exit(0)
}

const intentFilter = `
            <intent-filter>
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="${SCHEME}" />
            </intent-filter>
        </activity>`

// Inject before the closing </activity> of the MainActivity block.
const before = xml
const replaced = xml.replace(/(\s*)<\/activity>/, intentFilter)

if (replaced === before) {
  console.error('[patch-android-manifest] could not find </activity> to inject before')
  console.error('--- manifest dump ---')
  console.error(xml)
  process.exit(1)
}

writeFileSync(MANIFEST, replaced, 'utf8')
console.log('[patch-android-manifest] intent-filter injected')
console.log('--- AndroidManifest.xml (patched) ---')
console.log(replaced)
