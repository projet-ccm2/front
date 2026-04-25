# External Changes Required

## 1. GitHub Actions secret — `GCS_BUCKET_NAME`

In the `projet-ccm2/front` repository settings (**Settings → Secrets and variables → Actions**), add:

| Secret name       | Value                                                                            |
| ----------------- | -------------------------------------------------------------------------------- |
| `GCS_BUCKET_NAME` | The new GCS bucket name (same value as `GCP_BUCKET_NAME` used by bucket-manager) |

This replaces the old hardcoded `front-apk-dev` bucket name in the workflow.

---

## 2. `bucket-manager` repo — add APK download endpoint

**Repository**: `https://github.com/projet-ccm2/bucket-manager` (branch: `develop`)

Add `GET /bucket/apk/download?environment=<env>` following the same pattern as the existing `GET /bucket/image/get` endpoint.

### New files to create

#### `src/services/apkService.ts`

```typescript
import { Storage } from '@google-cloud/storage'

const storage = new Storage()
const bucketName = process.env.GCP_BUCKET_NAME!

export const apkService = {
  async getDownloadUrl(environment: string): Promise<string> {
    const filePath = `${environment}/latest.apk`
    const [url] = await storage
      .bucket(bucketName)
      .file(filePath)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      })
    return url
  },
}
```

#### `src/controllers/apkController.ts`

```typescript
import { Request, Response } from 'express'
import { apkService } from '../services/apkService'

const VALID_ENVIRONMENTS = ['development', 'integration', 'production']

export const apkController = {
  async getDownloadUrl(req: Request, res: Response): Promise<void> {
    const environment = (req.query.environment as string) || 'development'

    if (!VALID_ENVIRONMENTS.includes(environment)) {
      res
        .status(400)
        .json({ error: `Invalid environment. Must be one of: ${VALID_ENVIRONMENTS.join(', ')}` })
      return
    }

    try {
      const url = await apkService.getDownloadUrl(environment)
      res.json({ url })
    } catch (err) {
      res.status(500).json({ error: 'Failed to generate APK download URL' })
    }
  },
}
```

### Modify existing file

#### `src/routes/bucketRoutes.ts` (or equivalent route file)

Add alongside the existing image routes:

```typescript
import { apkController } from '../controllers/apkController'

// Existing image routes...
router.post('/bucket/image/insert', ...)
router.get('/bucket/image/get', ...)

// New APK route
router.get('/bucket/apk/download', apkController.getDownloadUrl)
```

### No new env vars needed

The endpoint reuses `GCP_BUCKET_NAME` already configured in bucket-manager. APKs are stored in the same bucket under `{environment}/latest.apk`.

---

## 3. `user-management` repo — deprecate `/apk/download`

The frontend no longer calls `user-management /apk/download`. The endpoint can be removed.

---

## Summary of what triggers what

```
Push to develop
  → build-android-apk.yml runs
  → uploads to gs://{GCS_BUCKET_NAME}/development/latest.apk

User clicks "Download APK" in sidebar
  → GET {BUCKET_MANAGER_URL}/bucket/apk/download?environment=development
  → bucket-manager returns { url: "signed_url" }
  → browser opens signed URL → APK downloads
```
