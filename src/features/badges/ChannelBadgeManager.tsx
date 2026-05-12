import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Save, Upload, X, BadgeInfo } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { achievementManagementClient } from '../achievements/api/achievementManagementClient'
import type {
  AchievementImageUpload,
  Badge as ChannelBadge,
  BadgeUpsertPayload,
} from '../achievements/api/achievementManagement.types'
import { createImageUploadFormValue } from '../achievements/forms/achievementFormModel'
import { BadgeThumbnail } from './components/BadgeThumbnail'
import { useChannelBadge } from './hooks/useChannelBadge'

function getBadgeErrorMessage(
  error: unknown,
  language: ReturnType<typeof useLanguage>['language']
) {
  if (error instanceof Error) {
    return error.message
  }

  return language === 'fr'
    ? 'Impossible de mettre à jour le badge de la chaîne.'
    : 'Unable to update the channel badge.'
}

interface ChannelBadgeManagerProps {
  className?: string
}

export function ChannelBadgeManager({ className = '' }: ChannelBadgeManagerProps) {
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const channelId = user?.channel.id ?? null
  const { badge, isLoading, errorMessage, isNotFound } = useChannelBadge(channelId)
  const [currentBadge, setCurrentBadge] = useState<ChannelBadge | null>(null)
  const [draftTitle, setDraftTitle] = useState('')
  const [selectedImageUpload, setSelectedImageUpload] = useState<AchievementImageUpload | null>(
    null
  )
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isPreparingImageUpload, setIsPreparingImageUpload] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)
  const imageFileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setCurrentBadge(badge)
  }, [badge])

  useEffect(() => {
    if (!currentBadge) {
      setDraftTitle('')
      setSelectedImageUpload(null)
      setImagePreviewUrl(null)
      return
    }

    setDraftTitle(currentBadge.title)
    setSelectedImageUpload(null)
    setImagePreviewUrl(null)
  }, [currentBadge])

  const currentImage = currentBadge?.image ?? null
  const previewImage = imagePreviewUrl ?? currentImage
  const hasLoadedBadge = !!currentBadge

  const displayedTitle = useMemo(() => {
    const trimmed = draftTitle.trim()
    return trimmed.length > 0 ? trimmed : currentBadge?.title ?? ''
  }, [currentBadge?.title, draftTitle])

  const handleOpenImagePicker = () => {
    imageFileInputRef.current?.click()
  }

  const handleImageClear = () => {
    setSelectedImageUpload(null)
    setImagePreviewUrl(null)
    setSaveError(null)
    setSaveSuccess(null)
    if (imageFileInputRef.current) {
      imageFileInputRef.current.value = ''
    }
  }

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
    const MAX_FILE_SIZE = 10 * 1024 * 1024

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setSaveError(t('badge.channel.image.error.type'))
      setSaveSuccess(null)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setSaveError(t('badge.channel.image.error.size'))
      setSaveSuccess(null)
      return
    }

    setIsPreparingImageUpload(true)
    setSaveError(null)
    setSaveSuccess(null)

    try {
      const uploadValue = await createImageUploadFormValue(file)
      setSelectedImageUpload(uploadValue)
      setImagePreviewUrl(uploadValue.contentBase64)
      setSaveError(null)
      setSaveSuccess(t('badge.channel.image.ready', { name: uploadValue.fileName }))
    } catch {
      setSaveError(t('badge.channel.image.error.prepare'))
    } finally {
      setIsPreparingImageUpload(false)
    }
  }

  const handleSave = async () => {
    if (!channelId || !currentBadge) {
      return
    }

    const nextTitle = draftTitle.trim()
    const payload: BadgeUpsertPayload = {}

    if (nextTitle) {
      payload.title = nextTitle
    }

    if (selectedImageUpload) {
      payload.imageUpload = selectedImageUpload
    } else if (currentImage !== null) {
      payload.image = currentImage
    }

    if (!payload.title && !payload.image && !payload.imageUpload) {
      setSaveError(t('badge.channel.error.validation'))
      return
    }

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(null)

    try {
      const updatedBadge = await achievementManagementClient.updateChannelBadge(channelId, payload)
      setCurrentBadge(updatedBadge)
      setSelectedImageUpload(null)
      setImagePreviewUrl(null)
      setSaveSuccess(t('badge.channel.saved'))
      toast.success(t('badge.channel.saved'))
    } catch (error) {
      setSaveError(getBadgeErrorMessage(error, language))
    } finally {
      setIsSaving(false)
    }
  }

  if (!user) {
    return (
      <div className={`rounded-xl border border-dashed border-[#2d2d31] p-6 text-center text-gray-400 dark:border-gray-200 dark:text-gray-600 ${className}`}>
        {t('badge.channel.signIn')}
      </div>
    )
  }

  return (
    <section
      className={`rounded-xl border border-[#2d2d31] bg-[#18181b] p-4 sm:p-6 dark:border-gray-200 dark:bg-white ${className}`}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#9146FF]/20">
          <BadgeInfo className="h-5 w-5 text-[#9146FF]" />
        </div>
        <div>
          <h2 className="text-xl text-white dark:text-gray-900">{t('badge.channel.title')}</h2>
          <p className="text-sm text-gray-400 dark:text-gray-600">
            {t('badge.channel.subtitle', { channelName: user.channel.name })}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="rounded-xl border border-dashed border-[#2d2d31] p-6 text-sm text-gray-400 dark:border-gray-200 dark:text-gray-600">
          {t('badge.channel.loading')}
        </div>
      )}

      {!isLoading && errorMessage && (
        <div className="rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
          {errorMessage}
        </div>
      )}

      {!isLoading && !errorMessage && isNotFound && (
        <div className="rounded-xl border border-dashed border-[#2d2d31] p-6 text-center text-gray-400 dark:border-gray-200 dark:text-gray-600">
          <div className="mb-2 text-base text-white dark:text-gray-900">
            {t('badge.channel.empty.title')}
          </div>
          <div className="text-sm">{t('badge.channel.empty.description')}</div>
        </div>
      )}

      {!isLoading && !errorMessage && hasLoadedBadge && (
        <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
          <div className="flex flex-col items-center gap-4 rounded-xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50">
            <BadgeThumbnail title={displayedTitle || currentBadge.title} image={previewImage} className="h-28 w-28" />
            <div className="text-center">
              <div className="text-sm text-gray-400 dark:text-gray-600">{t('badge.channel.preview')}</div>
              <div className="mt-1 text-base text-white dark:text-gray-900">
                {displayedTitle || currentBadge.title}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="channel-badge-title" className="mb-2 block text-sm text-gray-400 dark:text-gray-600">
                {t('badge.channel.form.title')}
              </label>
              <input
                id="channel-badge-title"
                type="text"
                value={draftTitle}
                onChange={event => setDraftTitle(event.target.value)}
                placeholder={t('badge.channel.form.titlePlaceholder')}
                className="w-full rounded-lg border border-transparent bg-[#2d2d31] px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#9146FF] focus:outline-none dark:bg-gray-100 dark:text-gray-900"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleOpenImagePicker}
                disabled={isPreparingImageUpload}
                className={`flex items-center justify-center gap-2 rounded-lg bg-[#2d2d31] px-4 py-2 text-white transition-colors hover:bg-[#3d3d41] dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 ${
                  isPreparingImageUpload ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <Upload className="h-4 w-4" />
                {isPreparingImageUpload ? t('badge.channel.form.preparing') : t('badge.channel.form.upload')}
              </button>
              <button
                type="button"
                onClick={handleImageClear}
                disabled={!selectedImageUpload}
                className={`flex items-center justify-center gap-2 rounded-lg px-4 py-2 transition-colors ${
                  selectedImageUpload
                    ? 'bg-[#ff4444]/15 text-[#ff8080] hover:bg-[#ff4444]/25'
                    : 'cursor-not-allowed bg-[#2d2d31] text-gray-500 dark:bg-gray-100'
                }`}
              >
                <X className="h-4 w-4" />
                {t('badge.channel.form.clear')}
              </button>
            </div>

            <p className="text-sm text-gray-400 dark:text-gray-600">{t('badge.channel.form.note')}</p>

            <input
              ref={imageFileInputRef}
              data-testid="channel-badge-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            <div className="rounded-lg border border-dashed border-[#4d4d51] p-4 text-sm text-gray-400 dark:border-gray-300 dark:text-gray-600">
              {selectedImageUpload ? (
                <span className="break-all">
                  {t('badge.channel.form.selected')}{' '}
                  <span className="text-white dark:text-gray-900">{selectedImageUpload.fileName}</span>
                </span>
              ) : currentImage ? (
                <span className="break-all">
                  {t('badge.channel.form.current')}{' '}
                  <span className="text-white dark:text-gray-900">{currentImage}</span>
                </span>
              ) : (
                <span>{t('badge.channel.form.empty')}</span>
              )}
            </div>

            {saveError && (
              <div className="rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
                {saveError}
              </div>
            )}

            {saveSuccess && !saveError && (
              <div className="rounded-xl border border-[#00f593]/40 bg-[#00f593]/10 p-4 text-sm text-[#00c27a] dark:text-[#008f52]">
                {saveSuccess}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className={`inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#9146FF] to-[#772ce8] px-5 py-3 text-white transition-all hover:from-[#772ce8] hover:to-[#9146FF] ${
                  isSaving ? 'cursor-not-allowed opacity-60' : ''
                }`}
              >
                <Save className="h-4 w-4" />
                {isSaving ? t('badge.channel.form.saving') : t('badge.channel.form.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
