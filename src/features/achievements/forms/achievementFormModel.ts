import type {
  Achievement,
  AchievementSuggestionResponse,
  AchievementTriggerLabel,
  AchievementUpsertPayload,
} from '../api/achievementManagement.types'
import type { Language } from '../../../i18n/translations'
import { resolveTranslation } from '../../../i18n/translations'

export type AchievementFormValues = AchievementUpsertPayload

export interface AchievementTriggerOption {
  value: AchievementTriggerLabel
  title: string
  description: string
}

export interface AchievementImageUploadFormValue {
  fileName: string
  mimeType: string
  contentBase64: string
}

const TRIGGER_LABEL_ALIASES: Record<string, AchievementTriggerLabel> = {
  message: 'countMessage',
  countmessage: 'countMessage',
  count_message: 'countMessage',
  contentMessage: 'contentMessage',
  contentmessage: 'contentMessage',
  content_message: 'contentMessage',
  message_content: 'contentMessage',
  channel_point_cost: 'countCostChannelPoint',
  channelpointcost: 'countCostChannelPoint',
  countcostchannelpoint: 'countCostChannelPoint',
  count_cost_channel_point: 'countCostChannelPoint',
  redeem_channel_point: 'countRedeemChannelPoint',
  redeemchannelpoint: 'countRedeemChannelPoint',
  countredeemchannelpoint: 'countRedeemChannelPoint',
  count_redeem_channel_point: 'countRedeemChannelPoint',
  api_caller: 'apicaller',
  apicaller: 'apicaller',
}

export function normalizeAchievementTriggerLabel(
  label: string | null | undefined
): AchievementTriggerLabel {
  const trimmedLabel = label?.trim()

  if (!trimmedLabel) {
    return 'message'
  }

  if (trimmedLabel in TRIGGER_LABEL_ALIASES) {
    return TRIGGER_LABEL_ALIASES[trimmedLabel]
  }

  if (
    trimmedLabel === 'countMessage' ||
    trimmedLabel === 'contentMessage' ||
    trimmedLabel === 'countCostChannelPoint' ||
    trimmedLabel === 'countRedeemChannelPoint' ||
    trimmedLabel === 'apicaller'
  ) {
    return trimmedLabel
  }

  return 'message'
}

export function getAchievementTriggerOptions(language: Language): AchievementTriggerOption[] {
  return [
    {
      value: 'countMessage',
      title: resolveTranslation(language, 'achievement.trigger.countMessage.title'),
      description: resolveTranslation(language, 'achievement.trigger.countMessage.description'),
    },
    {
      value: 'contentMessage',
      title: resolveTranslation(language, 'achievement.trigger.contentMessage.title'),
      description: resolveTranslation(language, 'achievement.trigger.contentMessage.description'),
    },
    {
      value: 'countCostChannelPoint',
      title: resolveTranslation(language, 'achievement.trigger.countCostChannelPoint.title'),
      description: resolveTranslation(
        language,
        'achievement.trigger.countCostChannelPoint.description'
      ),
    },
    {
      value: 'countRedeemChannelPoint',
      title: resolveTranslation(language, 'achievement.trigger.countRedeemChannelPoint.title'),
      description: resolveTranslation(
        language,
        'achievement.trigger.countRedeemChannelPoint.description'
      ),
    },
  ]
}

export const defaultAchievementFormValues: AchievementFormValues = {
  title: '',
  description: '',
  goal: 100,
  reward: 100,
  label: '',
  public: false,
  active: true,
  secret: false,
  image: null,
  type: {
    label: 'countMessage',
    data: null,
  },
}

export function mergeSuggestionIntoFormValues(
  currentValues: AchievementFormValues,
  suggestion: AchievementSuggestionResponse
): AchievementFormValues {
  const suggestedTriggerLabel = normalizeAchievementTriggerLabel(
    suggestion.type?.label ??
      suggestion.method ??
      suggestion.unlockingMethod ??
      suggestion.triggerType
  )
  const suggestedTriggerData = suggestion.type?.data ?? suggestion.triggerData ?? null

  return {
    ...currentValues,
    ...suggestion,
    type: {
      label: suggestedTriggerLabel,
      data: suggestedTriggerData,
    },
    label: currentValues.label,
    image: currentValues.image,
  }
}

export function createFormValuesFromAchievement(
  achievement: Pick<
    Achievement,
    | 'title'
    | 'description'
    | 'goal'
    | 'reward'
    | 'label'
    | 'public'
    | 'active'
    | 'secret'
    | 'image'
    | 'type'
  >
): AchievementFormValues {
  return {
    title: achievement.title,
    description: achievement.description,
    goal: achievement.goal,
    reward: achievement.reward,
    label: achievement.label,
    public: achievement.public,
    active: achievement.active,
    secret: achievement.secret,
    image: achievement.image,
    type: {
      label: normalizeAchievementTriggerLabel(achievement.type.label),
      data: achievement.type.data ?? null,
    },
  }
}

export function normalizeAchievementImage(image: string | null | undefined) {
  const trimmedImage = image?.trim()

  return trimmedImage ? trimmedImage : null
}

export async function createImageUploadFormValue(
  file: File
): Promise<AchievementImageUploadFormValue> {
  const contentBase64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      resolve(String(reader.result ?? ''))
    }
    reader.onerror = () => {
      reject(new Error('Unable to read the selected image file.'))
    }
    reader.readAsDataURL(file)
  })

  return {
    fileName: file.name,
    mimeType: file.type,
    contentBase64,
  }
}
