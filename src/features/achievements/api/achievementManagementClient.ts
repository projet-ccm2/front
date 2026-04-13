import type {
  Achievement,
  AchievementSuggestionPayload,
  AchievementSuggestionResponse,
  AchievementUpsertPayload,
  CreateAchievementPayload,
  UserAchievement,
} from './achievementManagement.types'

const ACHIEVEMENT_MANAGEMENT_SERVICE_URL =
  window._env_?.ACHIEVEMENT_MANAGEMENT_SERVICE_URL ||
  import.meta.env.VITE_ACHIEVEMENT_MANAGEMENT_SERVICE_URL ||
  'http://localhost:3001'

export class AchievementManagementError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown
  ) {
    super(message)
    this.name = 'AchievementManagementError'
  }
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${ACHIEVEMENT_MANAGEMENT_SERVICE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    let details: unknown = null

    try {
      details = await response.json()
    } catch {
      details = await response.text()
    }

    throw new AchievementManagementError(
      `Achievement-management request failed with status ${response.status}`,
      response.status,
      details
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

export const achievementManagementClient = {
  getAchievement(achievementId: string) {
    return requestJson<Achievement>(`/achievements/${achievementId}`)
  },
  getChannelAchievements(channelId: string) {
    return requestJson<Achievement[]>(`/achievements/channel/${channelId}`)
  },
  getPublicAchievements() {
    return requestJson<Achievement[]>('/achievements/public')
  },
  getUserAchievements(userId: string) {
    return requestJson<UserAchievement[]>(`/achievements/user/${userId}`)
  },
  getUserChannelAchievements(userId: string, channelId: string) {
    return requestJson<UserAchievement[]>(`/achievements/user/${userId}/channel/${channelId}`)
  },
  createAchievement(payload: CreateAchievementPayload) {
    return requestJson<Achievement>('/achievements', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateAchievement(achievementId: string, payload: AchievementUpsertPayload) {
    return requestJson<Achievement>(`/achievements/${achievementId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  },
  deleteAchievement(achievementId: string) {
    return requestJson<void>(`/achievements/${achievementId}`, {
      method: 'DELETE',
    })
  },
  activateAchievement(achievementId: string) {
    return requestJson<Achievement>(`/achievements/${achievementId}/activate`, {
      method: 'PATCH',
    })
  },
  deactivateAchievement(achievementId: string) {
    return requestJson<Achievement>(`/achievements/${achievementId}/deactivate`, {
      method: 'PATCH',
    })
  },
  getAiSuggestion(payload: AchievementSuggestionPayload) {
    return requestJson<AchievementSuggestionResponse>('/achievements/ai-suggestion', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
