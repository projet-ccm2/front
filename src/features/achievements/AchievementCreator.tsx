import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'
import { toast } from 'sonner'
import { ChannelSelector } from '../../components/ui/ChannelSelector'
import { Sparkles, Upload, Save, Send, Menu, X, Lock } from 'lucide-react'
import { useChannel } from '../../context/ChannelContext'
import { useLanguage } from '../../context/LanguageContext'
import { achievementManagementClient } from './api/achievementManagementClient'
import {
  createImageUploadFormValue,
  createFormValuesFromAchievement,
  defaultAchievementFormValues,
  getAchievementTriggerOptions,
  mergeSuggestionIntoFormValues,
  normalizeAchievementImage,
  normalizeAchievementTriggerLabel,
} from './forms/achievementFormModel'
import type { Achievement, AchievementTriggerLabel } from './api/achievementManagement.types'
import { isRenderableImageSource } from './utils/achievementImage'
import { isOwnerAchievementChannelId } from './utils/achievementManagementChannel'
import { useTwitchChannelRewards } from './hooks/useTwitchChannelRewards'

function getTriggerFieldConfig(label: AchievementTriggerLabel, t: (key: string) => string) {
  const showDetail = label === 'contentMessage' || label === 'countRedeemChannelPoint'
  const detailLabel =
    label === 'countRedeemChannelPoint'
      ? t('achievement.trigger.rewards.label')
      : t('achievement.trigger.dataLabel')
  const goalLabel =
    label === 'countMessage'
      ? t('achievement.goal.countMessage')
      : label === 'countCostChannelPoint'
        ? t('achievement.goal.countCostChannelPoint')
        : t('achievement.goal.default')
  return { showDetail, detailLabel, goalLabel }
}

interface AchievementCreatorProps {
  achievementId?: string | null
  templateAchievement?: Achievement | null
  onOpenSidebar: () => void
}

const TRIGGER_TYPES_REQUIRING_DATA: AchievementTriggerLabel[] = [
  'contentMessage',
  'countRedeemChannelPoint',
]

function getPublishValidationError(
  selectedChannel: { id: string } | null,
  t: (key: string) => string,
  formValues: {
    title: string
    description: string
    type: { label: AchievementTriggerLabel; data: unknown }
  }
): string | null {
  if (!selectedChannel) {
    return t('creator.validation.noChannel')
  }
  if (!isOwnerAchievementChannelId(selectedChannel.id)) {
    return t('achievement.ownerOnly.creator')
  }
  if (!formValues.title.trim() || !formValues.description.trim()) {
    return t('creator.validation.missingFields')
  }
  if (TRIGGER_TYPES_REQUIRING_DATA.includes(formValues.type.label) && !formValues.type.data) {
    return t('creator.validation.missingDetail')
  }
  return null
}

export function AchievementCreator({
  achievementId = null,
  templateAchievement = null,
  onOpenSidebar,
}: Readonly<AchievementCreatorProps>) {
  const { selectedChannel } = useChannel()
  const { language, t } = useLanguage()
  const isReadOnly = selectedChannel ? !isOwnerAchievementChannelId(selectedChannel.id) : false
  const { rewards, isLoading: isLoadingRewards, error: rewardsError } =
    useTwitchChannelRewards(selectedChannel?.id ?? null)
  const achievementTriggerOptions = getAchievementTriggerOptions(language)
  const [mode, setMode] = useState<'simple' | 'api'>('simple')
  const [formValues, setFormValues] = useState(defaultAchievementFormValues)
  const [aiPrompt, setAiPrompt] = useState(() => t('creator.ai.defaultPrompt'))
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingAchievement, setIsLoadingAchievement] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [templateMessage, setTemplateMessage] = useState<string | null>(null)
  const [imageUploadError, setImageUploadError] = useState<string | null>(null)
  const [imageUploadSuccess, setImageUploadSuccess] = useState<string | null>(null)
  const [isPreparingImageUpload, setIsPreparingImageUpload] = useState(false)
  const [selectedImageUpload, setSelectedImageUpload] = useState<{
    fileName: string
    mimeType: string
    contentBase64: string
  } | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const imageFileInputRef = useRef<HTMLInputElement | null>(null)

  const updateField = <K extends keyof typeof formValues>(
    field: K,
    value: (typeof formValues)[K]
  ) => {
    setFormValues(current => ({
      ...current,
      [field]: value,
    }))
  }

  const handleOpenImagePicker = () => {
    imageFileInputRef.current?.click()
  }

  const handleImageClear = () => {
    setSelectedImageUpload(null)
    setImagePreviewUrl(null)
    updateField('image', null)
    setImageUploadError(null)
    setImageUploadSuccess(null)
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
      setImageUploadError(t('creator.image.error.type'))
      setImageUploadSuccess(null)
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setImageUploadError(t('creator.image.error.size'))
      setImageUploadSuccess(null)
      return
    }

    setIsPreparingImageUpload(true)
    setImageUploadError(null)
    setImageUploadSuccess(null)

    try {
      const uploadValue = await createImageUploadFormValue(file)

      setSelectedImageUpload(uploadValue)
      setImagePreviewUrl(uploadValue.contentBase64)
      updateField('image', null)
      setImageUploadSuccess(t('creator.image.ready', { name: uploadValue.fileName }))
    } catch {
      setImageUploadError(t('creator.image.error.prepare'))
    } finally {
      setIsPreparingImageUpload(false)
    }
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError(t('creator.ai.error.empty'))
      return
    }

    setIsGenerating(true)
    setAiError(null)

    try {
      const suggestion = await achievementManagementClient.getAiSuggestion({
        prompt: aiPrompt.trim(),
      })
      const suggestedTriggerLabel = normalizeAchievementTriggerLabel(
        suggestion.type?.label ??
          suggestion.method ??
          suggestion.unlockingMethod ??
          suggestion.triggerType
      )

      setFormValues(current => mergeSuggestionIntoFormValues(current, suggestion))
      setMode(suggestedTriggerLabel === 'apicaller' ? 'api' : 'simple')
    } catch {
      setAiError(t('creator.ai.error.failed'))
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (!achievementId) {
      setFormValues(defaultAchievementFormValues)
      setIsLoadingAchievement(false)
      setLoadError(null)
      setImageUploadError(null)
      setImageUploadSuccess(null)
      setSelectedImageUpload(null)
      setImagePreviewUrl(null)
      return
    }

    let isMounted = true
    setIsLoadingAchievement(true)
    setLoadError(null)
    setImageUploadError(null)
    setImageUploadSuccess(null)
    setSelectedImageUpload(null)
    setImagePreviewUrl(null)

    const loadAchievement = async () => {
      try {
        const achievement = await achievementManagementClient.getAchievement(achievementId)

        if (!isMounted) {
          return
        }

        setFormValues(createFormValuesFromAchievement(achievement))
        setMode(achievement.type.label === 'apicaller' ? 'api' : 'simple')
      } catch {
        if (!isMounted) {
          return
        }

        setLoadError(t('creator.error.load'))
      } finally {
        if (isMounted) {
          setIsLoadingAchievement(false)
        }
      }
    }

    loadAchievement()

    return () => {
      isMounted = false
    }
  }, [achievementId, t])

  useEffect(() => {
    if (achievementId || !templateAchievement) {
      return
    }

    setFormValues(createFormValuesFromAchievement(templateAchievement))
    setMode('simple')
    setLoadError(null)
    setImageUploadError(null)
    setImageUploadSuccess(null)
    setSelectedImageUpload(null)
    setImagePreviewUrl(null)
    setTemplateMessage(t('creator.template.loaded', { title: templateAchievement.title }))
  }, [achievementId, templateAchievement, t])

  const handlePublish = async () => {
    const validationError = getPublishValidationError(selectedChannel, t, formValues)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setIsSubmitting(true)

    try {
      const normalizedTypeData =
        formValues.type.label === 'countCostChannelPoint'
          ? 1
          : (formValues.type.data ?? 'dummy label')
      const normalizedPayload = {
        ...formValues,
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        label: String(normalizedTypeData),
        type: { ...formValues.type, data: normalizedTypeData },
        image: selectedImageUpload ? null : normalizeAchievementImage(formValues.image),
        imageUpload: selectedImageUpload ?? null,
      }

      if (achievementId) {
        const updatedAchievement = await achievementManagementClient.updateAchievement(
          achievementId,
          normalizedPayload
        )
        setFormValues(createFormValuesFromAchievement(updatedAchievement))
        setSelectedImageUpload(null)
        setImagePreviewUrl(null)
        setImageUploadSuccess(null)
        setImageUploadError(null)
        toast.success(t('creator.toast.updated', { title: normalizedPayload.title }))
      } else {
        await achievementManagementClient.createAchievement({
          ...normalizedPayload,
          channelId: selectedChannel!.id,
        })
        setFormValues(defaultAchievementFormValues)
        setMode('simple')
        setSelectedImageUpload(null)
        setImagePreviewUrl(null)
        setImageUploadSuccess(null)
        setImageUploadError(null)
        toast.success(t('creator.toast.published', { title: normalizedPayload.title }))
      }
    } catch {
      toast.error(
        achievementId ? t('creator.toast.error.update') : t('creator.toast.error.publish')
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={onOpenSidebar}
                data-testid="mobile-menu-btn"
                className="lg:hidden text-white dark:text-gray-900 flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-2">
                  {achievementId ? t('creator.title.edit') : t('creator.title.create')}
                </h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                  {achievementId ? t('creator.subtitle.edit') : t('creator.subtitle.create')}
                </p>
              </div>
            </div>

            <div className="relative hidden sm:block flex-shrink-0">
              <ChannelSelector />
            </div>
          </div>
        </div>

        {isReadOnly && (
          <div className="mx-4 sm:mx-8 mt-4 flex items-center gap-3 rounded-xl border border-[#ffd700]/40 bg-[#ffd700]/10 px-4 py-3 text-sm text-[#ffd700] dark:text-[#a16200]">
            <Lock className="w-4 h-4 flex-shrink-0" />
            {t('creator.readOnly.banner')}
          </div>
        )}

        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#9146FF]/20 to-[#772ce8]/20 border-b border-[#2d2d31] dark:border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#9146FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white dark:text-gray-900">{t('creator.ai.title')}</div>
                    <div className="text-sm text-gray-400 dark:text-gray-600">
                      {t('creator.ai.description')}
                    </div>
                  </div>
                </div>
                <div className="w-full sm:w-auto sm:min-w-96">
                  <label htmlFor="ai-prompt" className="sr-only">
                    AI Prompt
                  </label>
                  <textarea
                    id="ai-prompt"
                    value={aiPrompt}
                    onChange={event => setAiPrompt(event.target.value)}
                    placeholder={t('creator.ai.placeholder')}
                    rows={2}
                    className="mb-3 w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors resize-none placeholder:text-gray-500"
                  />
                  <button
                    onClick={() => void handleAIGenerate()}
                    disabled={isGenerating}
                    className={`w-full px-6 py-3 bg-[#9146FF] hover:bg-[#772ce8] text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                      isGenerating ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    {isGenerating ? t('creator.ai.generating') : t('creator.ai.generate')}
                  </button>
                </div>
              </div>
              {aiError && (
                <div className="mt-4 text-sm text-[#ff8080] dark:text-[#b42318]">{aiError}</div>
              )}
            </div>

            <div className="p-4 sm:p-8">
              {isLoadingAchievement && (
                <div className="mb-6 rounded-xl border border-[#2d2d31] bg-[#2d2d31] p-4 text-sm text-gray-400 dark:border-gray-200 dark:bg-gray-100 dark:text-gray-600">
                  {t('creator.loading')}
                </div>
              )}

              {loadError && (
                <div className="mb-6 rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
                  {loadError}
                </div>
              )}

              {templateMessage && (
                <div className="mb-6 rounded-xl border border-[#9146FF]/40 bg-[#9146FF]/10 p-4 text-sm text-[#c6a8ff] dark:text-[#6f42c1]">
                  {templateMessage}
                </div>
              )}

              {imageUploadError && (
                <div className="mb-6 rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
                  {imageUploadError}
                </div>
              )}

              {imageUploadSuccess && (
                <div className="mb-6 rounded-xl border border-[#00f593]/40 bg-[#00f593]/10 p-4 text-sm text-[#00f593] dark:text-[#027a48]">
                  {imageUploadSuccess}
                </div>
              )}

              <div className="mb-8">
                <div className="block text-white dark:text-gray-900 mb-3 font-medium">
                  {t('creator.image.label')}
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <button
                    type="button"
                    onClick={handleOpenImagePicker}
                    disabled={isPreparingImageUpload}
                    aria-label={`${t('creator.image.upload')} ${t('creator.image.preview')}`}
                    className={`w-32 h-32 bg-[#2d2d31] dark:bg-gray-100 rounded-xl border-2 border-dashed border-[#4d4d51] dark:border-gray-300 flex items-center justify-center hover:border-[#9146FF] transition-colors flex-shrink-0 overflow-hidden ${
                      isPreparingImageUpload ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                  >
                    {imagePreviewUrl ? (
                      <img
                        src={imagePreviewUrl}
                        alt="Selected achievement image preview"
                        className="h-full w-full object-cover"
                      />
                    ) : formValues.image && isRenderableImageSource(formValues.image.trim()) ? (
                      <img
                        src={formValues.image.trim()}
                        alt="Current achievement image"
                        className="h-full w-full object-cover"
                        onError={e => {
                          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                        }}
                      />
                    ) : formValues.image ? (
                      <div className="flex h-full w-full items-center justify-center text-center px-3 text-xs text-gray-300 dark:text-gray-600 break-all">
                        <span>{formValues.image}</span>
                      </div>
                    ) : (
                      <Upload className="w-8 h-8 text-gray-500" />
                    )}
                  </button>
                  <div className="flex-1 w-full text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <button
                        type="button"
                        onClick={handleOpenImagePicker}
                        disabled={isPreparingImageUpload}
                        className={`px-4 py-2 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          isPreparingImageUpload ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        {isPreparingImageUpload
                          ? t('creator.image.preparing')
                          : t('creator.image.upload')}
                      </button>
                      <button
                        type="button"
                        onClick={handleImageClear}
                        disabled={!formValues.image && !selectedImageUpload}
                        className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                          !formValues.image && !selectedImageUpload
                            ? 'bg-[#2d2d31] dark:bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'bg-[#ff4444]/15 text-[#ff8080] hover:bg-[#ff4444]/25'
                        }`}
                      >
                        <X className="w-4 h-4" />
                        {t('creator.image.clear')}
                      </button>
                    </div>
                    <p className="text-sm text-gray-400 dark:text-gray-600 mt-2">
                      {t('creator.image.hint')}
                    </p>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-600">
                      {t('creator.image.note')}
                    </p>
                    <input
                      ref={imageFileInputRef}
                      data-testid="achievement-image-input"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <div className="mt-3 rounded-lg border border-dashed border-[#4d4d51] dark:border-gray-300 p-3 text-left text-xs text-gray-400 dark:text-gray-600">
                      {selectedImageUpload ? (
                        <span className="break-all">
                          {t('creator.image.selected')}{' '}
                          <span className="text-white dark:text-gray-900">
                            {selectedImageUpload.fileName}
                          </span>
                        </span>
                      ) : formValues.image ? (
                        <span className="break-all">
                          {t('creator.image.stored')}{' '}
                          <span className="text-white dark:text-gray-900">{formValues.image}</span>
                        </span>
                      ) : (
                        <span>{t('creator.image.empty')}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="achievement-title"
                  className="block text-white dark:text-gray-900 mb-3"
                >
                  {t('creator.field.title')}
                </label>
                <input
                  id="achievement-title"
                  type="text"
                  value={formValues.title}
                  onChange={event => updateField('title', event.target.value)}
                  placeholder={t('creator.field.title.placeholder')}
                  className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors placeholder:text-gray-500"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="achievement-description"
                  className="block text-white dark:text-gray-900 mb-3"
                >
                  {t('creator.field.description')}
                </label>
                <textarea
                  id="achievement-description"
                  value={formValues.description}
                  onChange={event => updateField('description', event.target.value)}
                  placeholder={t('creator.field.description.placeholder')}
                  rows={4}
                  className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors resize-none placeholder:text-gray-500"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="achievement-reward"
                  className="block text-white dark:text-gray-900 mb-3"
                >
                  {t('creator.field.reward')}
                </label>
                <input
                  id="achievement-reward"
                  type="number"
                  value={formValues.reward}
                  onChange={event => updateField('reward', Number(event.target.value) || 0)}
                  className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors"
                />
              </div>

              <div className="mb-8 space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => updateField('public', !formValues.public)}
                    className={`rounded-lg border px-4 py-4 text-left transition-colors ${
                      formValues.public
                        ? 'border-[#9146FF] bg-[#9146FF]/15 text-white dark:text-gray-900'
                        : 'border-[#2d2d31] bg-[#2d2d31] text-gray-400 dark:border-gray-200 dark:bg-gray-100 dark:text-gray-600'
                    }`}
                  >
                    <div className="font-medium">{t('creator.toggle.public.title')}</div>
                    <div className="mt-1 text-sm">{t('creator.toggle.public.description')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('active', !formValues.active)}
                    className={`rounded-lg border px-4 py-4 text-left transition-colors ${
                      formValues.active
                        ? 'border-[#9146FF] bg-[#9146FF]/15 text-white dark:text-gray-900'
                        : 'border-[#2d2d31] bg-[#2d2d31] text-gray-400 dark:border-gray-200 dark:bg-gray-100 dark:text-gray-600'
                    }`}
                  >
                    <div className="font-medium">{t('creator.toggle.active.title')}</div>
                    <div className="mt-1 text-sm">{t('creator.toggle.active.description')}</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => updateField('secret', !formValues.secret)}
                    className={`rounded-lg border px-4 py-4 text-left transition-colors ${
                      formValues.secret
                        ? 'border-[#9146FF] bg-[#9146FF]/15 text-white dark:text-gray-900'
                        : 'border-[#2d2d31] bg-[#2d2d31] text-gray-400 dark:border-gray-200 dark:bg-gray-100 dark:text-gray-600'
                    }`}
                  >
                    <div className="font-medium">{t('creator.toggle.secret.title')}</div>
                    <div className="mt-1 text-sm">{t('creator.toggle.secret.description')}</div>
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setMode('simple')
                      if (formValues.type.label === 'apicaller') {
                        setFormValues(current => ({
                          ...current,
                          type: { label: 'countMessage', data: null },
                        }))
                      }
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                      mode === 'simple'
                        ? 'bg-[#9146FF] text-white'
                        : 'bg-[#2d2d31] dark:bg-gray-100 text-gray-400 dark:text-gray-600 hover:bg-[#3d3d41] dark:hover:bg-gray-200'
                    }`}
                  >
                    {t('creator.mode.simple')}
                  </button>
                  <button
                    onClick={() => {
                      setMode('api')
                      setFormValues(current => ({
                        ...current,
                        type: { label: 'apicaller', data: null },
                      }))
                    }}
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                      mode === 'api'
                        ? 'bg-[#9146FF] text-white'
                        : 'bg-[#2d2d31] dark:bg-gray-100 text-gray-400 dark:text-gray-600 hover:bg-[#3d3d41] dark:hover:bg-gray-200'
                    }`}
                  >
                    {t('creator.mode.api')}
                  </button>
                </div>
              </div>

              {mode === 'simple' &&
                (() => {
                  const triggerConfig = getTriggerFieldConfig(formValues.type.label, t)
                  return (
                    <div className="mb-8">
                      <div className="mb-4">
                        <label
                          htmlFor="achievement-trigger-label"
                          className="block text-white dark:text-gray-900 mb-3 font-medium"
                        >
                          {t('achievement.trigger.label')}
                        </label>
                        <select
                          id="achievement-trigger-label"
                          value={formValues.type.label}
                          onChange={event =>
                            setFormValues(current => ({
                              ...current,
                              type: {
                                label: event.target.value as (typeof current.type)['label'],
                                data: null,
                              },
                            }))
                          }
                          className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none"
                        >
                          {achievementTriggerOptions.map(trigger => (
                            <option key={trigger.value} value={trigger.value}>
                              {trigger.title}
                            </option>
                          ))}
                        </select>
                        <p className="mt-2 text-sm text-gray-400 dark:text-gray-600">
                          {t('achievement.trigger.helper')}
                        </p>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-600">
                          {achievementTriggerOptions.find(
                            trigger => trigger.value === formValues.type.label
                          )?.description ?? ''}
                        </p>
                      </div>
                      <div
                        className={`grid gap-6 ${triggerConfig.showDetail ? 'sm:grid-cols-2' : ''}`}
                      >
                        {triggerConfig.showDetail && (
                          <div>
                            <label
                              htmlFor="achievement-trigger-data"
                              className="block text-white dark:text-gray-900 mb-3 font-medium"
                            >
                              {triggerConfig.detailLabel}
                            </label>
                            {formValues.type.label === 'countRedeemChannelPoint' ? (
                              <>
                                {isLoadingRewards && (
                                  <p className="text-sm text-gray-400 dark:text-gray-600 mb-2">
                                    {t('achievement.trigger.rewards.loading')}
                                  </p>
                                )}
                                {!isLoadingRewards && rewardsError && (
                                  <p className="text-sm text-red-400 dark:text-red-600 mb-2">
                                    {t('achievement.trigger.rewards.error')}
                                  </p>
                                )}
                                {!isLoadingRewards && !rewardsError && rewards.length === 0 && (
                                  <p className="text-sm text-gray-400 dark:text-gray-600 mb-2">
                                    {t('achievement.trigger.rewards.empty')}
                                  </p>
                                )}
                                <select
                                  id="achievement-trigger-data"
                                  value={
                                    formValues.type.data === null ? '' : String(formValues.type.data)
                                  }
                                  onChange={event =>
                                    setFormValues(current => ({
                                      ...current,
                                      type: {
                                        ...current.type,
                                        data: event.target.value || null,
                                      },
                                    }))
                                  }
                                  className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none"
                                >
                                  <option value="">...</option>
                                  {rewards.map(reward => (
                                    <option key={reward.id} value={reward.id}>
                                      {reward.title} — {reward.cost} pts
                                    </option>
                                  ))}
                                  {formValues.type.data !== null &&
                                    !rewards.some(r => r.id === String(formValues.type.data)) && (
                                      <option value={String(formValues.type.data)} disabled>
                                        {t('achievement.trigger.rewards.unknown', {
                                          id: String(formValues.type.data),
                                        })}
                                      </option>
                                    )}
                                </select>
                              </>
                            ) : (
                              <input
                                id="achievement-trigger-data"
                                type="text"
                                value={
                                  formValues.type.data === null
                                    ? ''
                                    : String(formValues.type.data ?? '')
                                }
                                onChange={event =>
                                  setFormValues(current => ({
                                    ...current,
                                    type: {
                                      ...current.type,
                                      data: event.target.value.trim() ? event.target.value : null,
                                    },
                                  }))
                                }
                                placeholder="..."
                                className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none placeholder:text-gray-500"
                              />
                            )}
                          </div>
                        )}
                        <div>
                          <label
                            htmlFor="achievement-goal"
                            className="block text-white dark:text-gray-900 mb-3 font-medium"
                          >
                            {triggerConfig.goalLabel}
                          </label>
                          <input
                            id="achievement-goal"
                            type="number"
                            value={formValues.goal}
                            onChange={event => updateField('goal', Number(event.target.value) || 0)}
                            className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })()}

              {mode === 'api' && (
                <div className="mb-8">
                  <label
                    htmlFor="achievement-goal-api"
                    className="block text-white dark:text-gray-900 mb-3 font-medium"
                  >
                    {t('achievement.goal.default')}
                  </label>
                  <input
                    id="achievement-goal-api"
                    type="number"
                    value={formValues.goal}
                    onChange={event => updateField('goal', Number(event.target.value) || 0)}
                    className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors"
                  />
                </div>
              )}

              <div className="mb-8 p-4 bg-[#2d2d31] dark:bg-gray-100 rounded-lg border-l-4 border-[#00f593]">
                <div className="flex items-center gap-2 text-[#00f593] mb-1">
                  <div className="w-2 h-2 bg-[#00f593] rounded-full" />
                  <span>{t('creator.version')}</span>
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">{t('creator.new')}</div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
                <button className="px-6 py-3 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {achievementId ? t('creator.action.saveChanges') : t('creator.action.saveDraft')}
                </button>
                <button
                  onClick={() => void handlePublish()}
                  disabled={isReadOnly || isSubmitting || isLoadingAchievement || Boolean(loadError)}
                  className={`px-6 py-3 bg-gradient-to-r from-[#9146FF] to-[#772ce8] hover:from-[#772ce8] hover:to-[#9146FF] text-white rounded-lg transition-all flex items-center justify-center gap-2 ${
                    isReadOnly || isSubmitting || isLoadingAchievement || loadError
                      ? 'opacity-60 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting
                    ? achievementId
                      ? t('creator.action.saving')
                      : t('creator.action.publishing')
                    : achievementId
                      ? t('creator.action.update')
                      : t('creator.action.publish')}
                </button>
              </div>
              {isSubmitting && (
                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-[#2d2d31] dark:bg-gray-200">
                  <div
                    className="h-full w-2/5 rounded-full bg-gradient-to-r from-[#9146FF] to-[#772ce8]"
                    style={{ animation: 'publishSlide 1.5s ease-in-out infinite' }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
