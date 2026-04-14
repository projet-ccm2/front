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

export const ACHIEVEMENT_PLACEHOLDER_IMAGE_URL = 'https://placehold.co/512x512/png?text=Achievement'

export function getAchievementTriggerOptions(language: Language): AchievementTriggerOption[] {
  return [
    {
      value: 'message',
      title: resolveTranslation(language, 'achievement.trigger.message.title'),
      description: resolveTranslation(language, 'achievement.trigger.message.description'),
    },
    {
      value: 'message_content',
      title: resolveTranslation(language, 'achievement.trigger.message_content.title'),
      description: resolveTranslation(language, 'achievement.trigger.message_content.description'),
    },
    {
      value: 'channel_point_cost',
      title: resolveTranslation(language, 'achievement.trigger.channel_point_cost.title'),
      description: resolveTranslation(
        language,
        'achievement.trigger.channel_point_cost.description'
      ),
    },
    {
      value: 'redeem_channel_point',
      title: resolveTranslation(language, 'achievement.trigger.redeem_channel_point.title'),
      description: resolveTranslation(
        language,
        'achievement.trigger.redeem_channel_point.description'
      ),
    },
    {
      value: 'api_caller',
      title: resolveTranslation(language, 'achievement.trigger.api_caller.title'),
      description: resolveTranslation(language, 'achievement.trigger.api_caller.description'),
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
    label: 'message',
    data: null,
  },
}

export function mergeSuggestionIntoFormValues(
  currentValues: AchievementFormValues,
  suggestion: AchievementSuggestionResponse
): AchievementFormValues {
  return {
    ...currentValues,
    ...suggestion,
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
    type: achievement.type,
  }
}

export function normalizeAchievementImage(image: string | null | undefined) {
  const trimmedImage = image?.trim()

  return trimmedImage ? trimmedImage : ACHIEVEMENT_PLACEHOLDER_IMAGE_URL
}
