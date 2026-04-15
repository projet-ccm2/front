export type AchievementTriggerLabel =
  | 'message'
  | 'message_content'
  | 'channel_point_cost'
  | 'redeem_channel_point'
  | 'api_caller'

export interface AchievementType {
  label: AchievementTriggerLabel
  data: string | number | boolean | Record<string, unknown> | null
}

export interface AchievementImageUpload {
  fileName: string
  mimeType: string
  contentBase64: string
}

export interface Achievement {
  id: string
  title: string
  description: string
  goal: number
  reward: number
  label: string
  public: boolean
  downloads: number
  visits: number
  active: boolean
  secret: boolean
  image: string | null
  channelId: string | null
  type: AchievementType
}

export interface UserAchievement extends Achievement {
  userState: {
    progressCount: number
    finished: boolean
    acquiredDate: string | null
  }
}

export interface AchievementUpsertPayload {
  title: string
  description: string
  goal: number
  reward: number
  label: string
  public: boolean
  active: boolean
  secret: boolean
  image: string | null
  imageUpload?: AchievementImageUpload | null
  type: AchievementType
}

export interface CreateAchievementPayload extends AchievementUpsertPayload {
  channelId: string
}

export interface AchievementSuggestionPayload {
  prompt: string
}

export interface AchievementSuggestionResponse {
  title: string
  description: string
  goal: number
  reward: number
  public: boolean
  active: boolean
  secret: boolean
  type: AchievementType
}
