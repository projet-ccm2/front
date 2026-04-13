import { useEffect, useState } from 'react'
import { ChannelSelector } from '../../components/ui/ChannelSelector'
import { Sparkles, Upload, Save, Send, Menu } from 'lucide-react'
import { useChannel } from '../../context/ChannelContext'
import { achievementManagementClient } from './api/achievementManagementClient'
import {
  achievementTriggerOptions,
  createFormValuesFromAchievement,
  defaultAchievementFormValues,
  mergeSuggestionIntoFormValues,
} from './forms/achievementFormModel'
import type { Achievement } from './api/achievementManagement.types'
import {
  getOwnerOnlyAchievementMessage,
  isOwnerAchievementChannelId,
} from './utils/achievementManagementChannel'

interface AchievementCreatorProps {
  achievementId?: string | null
  templateAchievement?: Achievement | null
  onOpenSidebar: () => void
}

const formatTriggerLabel = (label: string) =>
  label
    .split('_')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

export function AchievementCreator({
  achievementId = null,
  templateAchievement = null,
  onOpenSidebar,
}: Readonly<AchievementCreatorProps>) {
  const { selectedChannel } = useChannel()
  const [mode, setMode] = useState<'simple' | 'advanced'>('simple')
  const [formValues, setFormValues] = useState(defaultAchievementFormValues)
  const [aiPrompt, setAiPrompt] = useState(
    'Create an achievement for a user who sends 100 messages'
  )
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingAchievement, setIsLoadingAchievement] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [templateMessage, setTemplateMessage] = useState<string | null>(null)

  const updateField = <K extends keyof typeof formValues>(
    field: K,
    value: (typeof formValues)[K]
  ) => {
    setFormValues(current => ({
      ...current,
      [field]: value,
    }))
  }

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setAiError('Enter an AI prompt before requesting a suggestion.')
      return
    }

    setIsGenerating(true)
    setAiError(null)

    try {
      const suggestion = await achievementManagementClient.getAiSuggestion({
        prompt: aiPrompt.trim(),
      })

      setFormValues(current => mergeSuggestionIntoFormValues(current, suggestion))
    } catch {
      setAiError('Unable to generate an AI suggestion right now.')
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (!achievementId) {
      setFormValues(defaultAchievementFormValues)
      setLoadError(null)
      setSubmitError(null)
      setSubmitSuccess(null)
      return
    }

    let isMounted = true
    setIsLoadingAchievement(true)
    setLoadError(null)
    setSubmitError(null)
    setSubmitSuccess(null)

    const loadAchievement = async () => {
      try {
        const achievement = await achievementManagementClient.getAchievement(achievementId)

        if (!isMounted) {
          return
        }

        setFormValues(createFormValuesFromAchievement(achievement))
      } catch {
        if (!isMounted) {
          return
        }

        setLoadError('Unable to load this achievement for editing.')
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
  }, [achievementId])

  useEffect(() => {
    if (achievementId || !templateAchievement) {
      return
    }

    setFormValues(createFormValuesFromAchievement(templateAchievement))
    setMode('advanced')
    setLoadError(null)
    setSubmitError(null)
    setSubmitSuccess(null)
    setTemplateMessage(`Template "${templateAchievement.title}" loaded from the marketplace.`)
  }, [achievementId, templateAchievement])

  const handlePublish = async () => {
    if (!selectedChannel) {
      setSubmitError('Select a channel before publishing an achievement.')
      setSubmitSuccess(null)
      return
    }

    if (!isOwnerAchievementChannelId(selectedChannel.id)) {
      setSubmitError(getOwnerOnlyAchievementMessage('creator'))
      setSubmitSuccess(null)
      return
    }

    if (!formValues.title.trim() || !formValues.description.trim()) {
      setSubmitError('Title and description are required before publishing.')
      setSubmitSuccess(null)
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(null)

    try {
      const normalizedPayload = {
        ...formValues,
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        label: formValues.label.trim(),
      }

      if (achievementId) {
        await achievementManagementClient.updateAchievement(achievementId, normalizedPayload)
        setSubmitSuccess(`Achievement "${normalizedPayload.title}" was updated.`)
      } else {
        await achievementManagementClient.createAchievement({
          ...normalizedPayload,
          channelId: selectedChannel.id,
        })
        setSubmitSuccess(`Achievement "${normalizedPayload.title}" was published.`)
      }
    } catch {
      setSubmitError(
        achievementId
          ? 'Unable to update this achievement right now.'
          : 'Unable to publish this achievement right now.'
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
                  {achievementId ? 'Edit Achievement' : 'Create Achievement'}
                </h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                  {achievementId
                    ? 'Update an existing quest for your community'
                    : 'Design a new quest for your community'}
                </p>
              </div>
            </div>

            <div className="relative hidden sm:block flex-shrink-0">
              <ChannelSelector />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 sm:p-8">
          <div className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-[#9146FF]/20 to-[#772ce8]/20 border-b border-[#2d2d31] dark:border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#9146FF] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white dark:text-gray-900">AI-Powered Generation</div>
                    <div className="text-sm text-gray-400 dark:text-gray-600">
                      Let AI create an achievement based on your channel context
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
                    placeholder="Describe the achievement you want AI to draft..."
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
                    {isGenerating ? 'Generating...' : 'Generate with AI'}
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
                  Loading achievement data...
                </div>
              )}

              {loadError && (
                <div className="mb-6 rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
                  {loadError}
                </div>
              )}

              {submitError && (
                <div className="mb-6 rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-sm text-[#ff8080] dark:text-[#b42318]">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="mb-6 rounded-xl border border-[#00f593]/40 bg-[#00f593]/10 p-4 text-sm text-[#00f593] dark:text-[#027a48]">
                  {submitSuccess}
                </div>
              )}

              {templateMessage && (
                <div className="mb-6 rounded-xl border border-[#9146FF]/40 bg-[#9146FF]/10 p-4 text-sm text-[#c6a8ff] dark:text-[#6f42c1]">
                  {templateMessage}
                </div>
              )}

              <div className="mb-8">
                <div className="block text-white dark:text-gray-900 mb-3 font-medium">
                  Achievement Icon
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <div className="w-32 h-32 bg-[#2d2d31] dark:bg-gray-100 rounded-xl border-2 border-dashed border-[#4d4d51] dark:border-gray-300 flex items-center justify-center hover:border-[#9146FF] transition-colors cursor-pointer flex-shrink-0">
                    <Upload className="w-8 h-8 text-gray-500" />
                  </div>
                  <div className="flex-1 w-full text-center sm:text-left">
                    <button className="px-4 py-2 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors">
                      Upload Image
                    </button>
                    <p className="text-sm text-gray-400 dark:text-gray-600 mt-2">
                      Recommended: 512x512px PNG or JPG
                    </p>
                    <input
                      type="text"
                      value={formValues.image ?? ''}
                      onChange={event =>
                        updateField('image', event.target.value.trim() ? event.target.value : null)
                      }
                      placeholder="Optional image URL..."
                      className="mt-3 w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors placeholder:text-gray-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="achievement-title"
                  className="block text-white dark:text-gray-900 mb-3"
                >
                  Achievement Title
                </label>
                <input
                  id="achievement-title"
                  type="text"
                  value={formValues.title}
                  onChange={event => updateField('title', event.target.value)}
                  placeholder="Enter achievement name..."
                  className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors placeholder:text-gray-500"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="achievement-description"
                  className="block text-white dark:text-gray-900 mb-3"
                >
                  Description
                </label>
                <textarea
                  id="achievement-description"
                  value={formValues.description}
                  onChange={event => updateField('description', event.target.value)}
                  placeholder="Describe how to unlock this achievement..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors resize-none placeholder:text-gray-500"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="achievement-goal"
                    className="block text-white dark:text-gray-900 mb-3"
                  >
                    Goal
                  </label>
                  <input
                    id="achievement-goal"
                    type="number"
                    value={formValues.goal}
                    onChange={event => updateField('goal', Number(event.target.value) || 0)}
                    className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label
                    htmlFor="achievement-reward"
                    className="block text-white dark:text-gray-900 mb-3"
                  >
                    Reward (XP / Points)
                  </label>
                  <input
                    id="achievement-reward"
                    type="number"
                    value={formValues.reward}
                    onChange={event => updateField('reward', Number(event.target.value) || 0)}
                    className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="achievement-label"
                  className="block text-white dark:text-gray-900 mb-3"
                >
                  Label
                </label>
                <input
                  id="achievement-label"
                  type="text"
                  value={formValues.label}
                  onChange={event => updateField('label', event.target.value)}
                  placeholder="Optional short badge label..."
                  className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none transition-colors placeholder:text-gray-500"
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
                    <div className="font-medium">Public Template</div>
                    <div className="mt-1 text-sm">Allow marketplace reuse.</div>
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
                    <div className="font-medium">Active</div>
                    <div className="mt-1 text-sm">Achievement available immediately.</div>
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
                    <div className="font-medium">Secret Achievement</div>
                    <div className="mt-1 text-sm">Hidden until unlocked.</div>
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setMode('simple')}
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                      mode === 'simple'
                        ? 'bg-[#9146FF] text-white'
                        : 'bg-[#2d2d31] dark:bg-gray-100 text-gray-400 dark:text-gray-600 hover:bg-[#3d3d41] dark:hover:bg-gray-200'
                    }`}
                  >
                    Simple Mode
                  </button>
                  <button
                    onClick={() => setMode('advanced')}
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors ${
                      mode === 'advanced'
                        ? 'bg-[#9146FF] text-white'
                        : 'bg-[#2d2d31] dark:bg-gray-100 text-gray-400 dark:text-gray-600 hover:bg-[#3d3d41] dark:hover:bg-gray-200'
                    }`}
                  >
                    Advanced Mode
                  </button>
                </div>
              </div>

              {mode === 'advanced' && (
                <div className="mb-8 grid sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="achievement-trigger-label"
                      className="block text-white dark:text-gray-900 mb-3 font-medium"
                    >
                      Trigger Type
                    </label>
                    <select
                      id="achievement-trigger-label"
                      value={formValues.type.label}
                      onChange={event =>
                        setFormValues(current => ({
                          ...current,
                          type: {
                            ...current.type,
                            label: event.target.value as (typeof current.type)['label'],
                          },
                        }))
                      }
                      className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none"
                    >
                      {achievementTriggerOptions.map(trigger => (
                        <option key={trigger} value={trigger}>
                          {formatTriggerLabel(trigger)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="achievement-trigger-data"
                      className="block text-white dark:text-gray-900 mb-3 font-medium"
                    >
                      Trigger Data
                    </label>
                    <input
                      id="achievement-trigger-data"
                      type="text"
                      value={formValues.type.data === null ? '' : String(formValues.type.data)}
                      onChange={event =>
                        setFormValues(current => ({
                          ...current,
                          type: {
                            ...current.type,
                            data: event.target.value.trim() ? event.target.value : null,
                          },
                        }))
                      }
                      placeholder="Optional trigger data..."
                      className="w-full px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none placeholder:text-gray-500"
                    />
                  </div>
                </div>
              )}

              <div className="mb-8 p-4 bg-[#2d2d31] dark:bg-gray-100 rounded-lg border-l-4 border-[#00f593]">
                <div className="flex items-center gap-2 text-[#00f593] mb-1">
                  <div className="w-2 h-2 bg-[#00f593] rounded-full" />
                  <span>Version 1.0</span>
                </div>
                <div className="text-sm text-gray-400 dark:text-gray-600">
                  This is a new achievement
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-4">
                <button className="px-6 py-3 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" />
                  {achievementId ? 'Save Changes' : 'Save Draft'}
                </button>
                <button
                  onClick={() => void handlePublish()}
                  disabled={isSubmitting || isLoadingAchievement || Boolean(loadError)}
                  className={`px-6 py-3 bg-gradient-to-r from-[#9146FF] to-[#772ce8] hover:from-[#772ce8] hover:to-[#9146FF] text-white rounded-lg transition-all flex items-center justify-center gap-2 ${
                    isSubmitting || isLoadingAchievement || loadError
                      ? 'opacity-60 cursor-not-allowed'
                      : ''
                  }`}
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting
                    ? achievementId
                      ? 'Saving...'
                      : 'Publishing...'
                    : achievementId
                      ? 'Update Achievement'
                      : 'Publish Achievement'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
