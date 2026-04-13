import type {
  Achievement,
  AchievementSuggestionResponse,
  AchievementTriggerLabel,
  AchievementUpsertPayload,
} from '../api/achievementManagement.types'

export type AchievementFormValues = AchievementUpsertPayload

export const achievementTriggerOptions: AchievementTriggerLabel[] = [
  'message',
  'message_content',
  'channel_point_cost',
  'redeem_channel_point',
  'api_caller',
]

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
