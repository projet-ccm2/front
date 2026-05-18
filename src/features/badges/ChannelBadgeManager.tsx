import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Save, Upload, X, BadgeInfo, Lock, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../context/AuthContext'
import { useChannel } from '../../context/ChannelContext'
import { useLanguage } from '../../context/LanguageContext'
import { achievementManagementClient } from '../achievements/api/achievementManagementClient'
import type {
  AchievementImageUpload,
  Badge as ChannelBadge,
  BadgeUpsertPayload,
} from '../achievements/api/achievementManagement.types'
import { createImageUploadFormValue } from '../achievements/forms/achievementFormModel'
import { isOwnerAchievementChannelId } from '../achievements/utils/achievementManagementChannel'
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
  readonly className?: string
}

export function ChannelBadgeManager({ className = '' }: ChannelBadgeManagerProps) {
  const { user } = useAuth()
  const { selectedChannel } = useChannel()
  const { language, t } = useLanguage()
  const isOwnerChannel = selectedChannel ? isOwnerAchievementChannelId(selectedChannel.id) : false
  const channelId = isOwnerChannel ? (selectedChannel?.id ?? null) : null
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
    return trimmed.length > 0 ? trimmed : (currentBadge?.title ?? '')
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
    }

    if (!payload.title && !payload.imageUpload) {
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
      <div
        className={`rounded-xl border border-dashed border-[#2d2d31] p-6 text-center text-gray-400 dark:border-gray-200 dark:text-gray-600 ${className}`}
      >
        {t('badge.channel.signIn')}
      </div>
    )
  }

  if (!selectedChannel) {
    return (
      <div
        className={`rounded-xl border border-dashed border-[#2d2d31] p-6 text-center text-gray-400 dark:border-gray-200 dark:text-gray-600 ${className}`}
      >
        {t('badge.channel.noChannel')}
      </div>
    )
  }

  const badgeInfoText = selectedImageUpload ? (
    <span>
      {t('badge.channel.form.selected')}{' '}
      <span className="font-medium text-white dark:text-gray-900">
        {selectedImageUpload.fileName}
      </span>
    </span>
  ) : currentImage ? (
    <span className="text-white dark:text-gray-900">
      {t('badge.channel.form.current')}
    </span>
  ) : (
    <span>{t('badge.channel.form.empty')}</span>
  )

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
            {t('badge.channel.subtitle', { channelName: selectedChannel.name })}
          </p>
        </div>
      </div>

      {!isOwnerChannel && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#ffd700]/40 bg-[#ffd700]/10 px-4 py-3 text-sm text-[#ffd700] dark:text-[#a16200]">
          <Lock className="h-4 w-4 flex-shrink-0" />
          {t('badge.channel.ownerOnly')}
        </div>
      )}

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
        <div
          className="flex flex-col gap-5 lg:flex-row"
          style={{
            alignItems: 'stretch',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.25rem',
          }}
        >
          <div
            className="rounded-xl border border-[#2d2d31] bg-[#0f0f12] p-4 dark:border-gray-200 dark:bg-gray-50"
            style={{
              background:
                'linear-gradient(145deg, rgba(145, 70, 255, 0.14), rgba(15, 15, 18, 0.98) 42%)',
              border: '1px solid #2d2d31',
              borderRadius: '16px',
              display: 'flex',
              flex: '0 1 280px',
              flexDirection: 'column',
              gap: '1rem',
              justifyContent: 'space-between',
              minHeight: '260px',
              padding: '1rem',
            }}
          >
            <div>
              <div
                style={{
                  color: '#b9a7ff',
                  fontSize: '0.75rem',
                  letterSpacing: '0.08em',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                {t('badge.channel.preview')}
              </div>
              <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center' }}>
                <BadgeThumbnail
                  title={displayedTitle || currentBadge.title}
                  image={previewImage}
                  className="h-24 w-24"
                  style={{
                    height: '132px',
                    width: '132px',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.24)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                padding: '0.75rem',
                textAlign: 'center',
              }}
            >
              <div style={{ color: '#ffffff', fontSize: '1rem', fontWeight: 700 }}>
                {displayedTitle || currentBadge.title}
              </div>
              <div style={{ color: '#a1a1aa', fontSize: '0.75rem', marginTop: '0.125rem' }}>
                {selectedChannel.name}
              </div>
            </div>
          </div>

          <div
            className="space-y-4"
            style={{
              flex: '1 1 360px',
              minWidth: 'min(100%, 320px)',
            }}
          >
            <div>
              <label
                htmlFor="channel-badge-title"
                className="mb-2 block text-sm text-gray-400 dark:text-gray-600"
                style={{ color: '#b7b7c5', display: 'block', fontSize: '0.875rem', marginBottom: '0.5rem' }}
              >
                {t('badge.channel.form.title')}
              </label>
              <input
                id="channel-badge-title"
                type="text"
                value={draftTitle}
                onChange={event => setDraftTitle(event.target.value)}
                placeholder={t('badge.channel.form.titlePlaceholder')}
                className="w-full rounded-lg border border-transparent bg-[#2d2d31] px-4 py-3 text-white placeholder:text-gray-500 focus:border-[#9146FF] focus:outline-none dark:bg-gray-100 dark:text-gray-900"
                style={{
                  backgroundColor: '#2d2d31',
                  border: '1px solid transparent',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '1rem',
                  outline: 'none',
                  padding: '0.875rem 1rem',
                  width: '100%',
                }}
              />
            </div>

            <div
              className="flex flex-col gap-3 sm:flex-row"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={handleOpenImagePicker}
                disabled={isPreparingImageUpload}
                className={`flex items-center justify-center gap-2 rounded-lg bg-[#2d2d31] px-4 py-2 text-white transition-colors hover:bg-[#3d3d41] dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 ${
                  isPreparingImageUpload ? 'cursor-not-allowed opacity-60' : ''
                }`}
                style={{
                  alignItems: 'center',
                  backgroundColor: '#2d2d31',
                  border: '1px solid #3d3d41',
                  borderRadius: '10px',
                  color: '#ffffff',
                  display: 'inline-flex',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  gap: '0.5rem',
                  justifyContent: 'center',
                  minHeight: '42px',
                  opacity: isPreparingImageUpload ? 0.6 : 1,
                  padding: '0.625rem 1rem',
                }}
              >
                <Upload className="h-4 w-4" />
                {isPreparingImageUpload
                  ? t('badge.channel.form.preparing')
                  : t('badge.channel.form.upload')}
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
                style={{
                  alignItems: 'center',
                  backgroundColor: selectedImageUpload ? 'rgba(255, 68, 68, 0.14)' : '#232327',
                  border: selectedImageUpload
                    ? '1px solid rgba(255, 68, 68, 0.25)'
                    : '1px solid #2d2d31',
                  borderRadius: '10px',
                  color: selectedImageUpload ? '#ff9a9a' : '#71717a',
                  display: 'inline-flex',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  gap: '0.5rem',
                  justifyContent: 'center',
                  minHeight: '42px',
                  padding: '0.625rem 1rem',
                }}
              >
                <X className="h-4 w-4" />
                {t('badge.channel.form.clear')}
              </button>
            </div>

            <input
              ref={imageFileInputRef}
              data-testid="channel-badge-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageChange}
              className="hidden"
            />

            <div
              className="flex items-center gap-3 rounded-lg border border-dashed border-[#4d4d51] p-4 text-sm text-gray-400 dark:border-gray-300 dark:text-gray-600"
              style={{
                alignItems: 'center',
                border: '1px dashed #4d4d51',
                borderRadius: '12px',
                color: '#a1a1aa',
                display: 'flex',
                fontSize: '0.875rem',
                gap: '0.75rem',
                padding: '0.875rem 1rem',
              }}
            >
              <ImageIcon className="h-4 w-4 flex-shrink-0" />
              {badgeInfoText}
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

            <div className="flex justify-end" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={isSaving}
                className={`inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#9146FF] to-[#772ce8] px-5 py-3 text-white transition-all hover:from-[#772ce8] hover:to-[#9146FF] ${
                  isSaving ? 'cursor-not-allowed opacity-60' : ''
                }`}
                style={{
                  alignItems: 'center',
                  background: 'linear-gradient(135deg, #9146FF, #772ce8)',
                  border: 0,
                  borderRadius: '12px',
                  color: '#ffffff',
                  display: 'inline-flex',
                  fontSize: '0.9375rem',
                  fontWeight: 700,
                  gap: '0.5rem',
                  justifyContent: 'center',
                  minHeight: '44px',
                  opacity: isSaving ? 0.6 : 1,
                  padding: '0.75rem 1.125rem',
                  whiteSpace: 'nowrap',
                }}
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
