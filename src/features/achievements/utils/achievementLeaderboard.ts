import type { UserAchievement, Achievement } from '../api/achievementManagement.types'

type Translate = (key: string, params?: Record<string, string | number>) => string

export interface LeaderboardEntry {
  rank: number
  title: string
  xp: number
  avatar: string
  status: string
  isUnlocked: boolean
}

export interface PanelAchievementEntry {
  id: string
  title: string
  description: string
  avatar: string
  image: string | null
  progressText: string
  progressPercent: number
  reward: number
  isUnlocked: boolean
  isHidden: boolean
}

export interface PublicPanelAchievementEntry {
  id: string
  title: string
  description: string
  avatar: string
  image: string | null
  status: string
  reward: number
  isHidden: boolean
  isPublic: boolean
  isActive: boolean
}

function sortAchievements(achievements: UserAchievement[]) {
  return achievements.slice().sort((left, right) => {
    const rewardDiff = right.reward - left.reward
    if (rewardDiff !== 0) {
      return rewardDiff
    }

    const finishedDiff = Number(right.userState.finished) - Number(left.userState.finished)
    if (finishedDiff !== 0) {
      return finishedDiff
    }

    const progressDiff = right.userState.progressCount - left.userState.progressCount
    if (progressDiff !== 0) {
      return progressDiff
    }

    return left.title.localeCompare(right.title)
  })
}

export function buildLeaderboardEntries(
  achievements: UserAchievement[],
  t: Translate
): LeaderboardEntry[] {
  return sortAchievements(achievements)
    .slice(0, 5)
    .map((achievement, index) => ({
      rank: index + 1,
      title: achievement.title,
      xp: achievement.reward,
      avatar:
        achievement.label.trim().charAt(0).toUpperCase() ||
        achievement.title.charAt(0).toUpperCase() ||
        'A',
      status: achievement.userState.finished
        ? t('achievements.status.unlocked')
        : t('achievements.status.progress', {
            current: achievement.userState.progressCount,
            goal: achievement.goal,
          }),
      isUnlocked: achievement.userState.finished,
    }))
}

export function buildPanelAchievementEntries(
  achievements: UserAchievement[],
  t: Translate
): PanelAchievementEntry[] {
  return sortAchievements(achievements).map(achievement => {
    const isHidden = achievement.secret && !achievement.userState.finished
    const progressPercent = Math.max(
      0,
      Math.min((achievement.userState.progressCount / Math.max(achievement.goal, 1)) * 100, 100)
    )

    return {
      id: achievement.id,
      title: isHidden ? t('achievements.hidden.title') : achievement.title,
      description: isHidden ? t('achievements.hidden.description') : achievement.description,
      avatar: isHidden
        ? '?'
        : achievement.label.trim().charAt(0).toUpperCase() ||
          achievement.title.charAt(0).toUpperCase() ||
          'A',
      progressText: achievement.userState.finished
        ? t('achievements.status.unlocked')
        : t('achievements.status.progress', {
            current: achievement.userState.progressCount,
            goal: achievement.goal,
          }),
      image: isHidden ? null : (achievement.image ?? null),
      progressPercent,
      reward: achievement.reward,
      isUnlocked: achievement.userState.finished,
      isHidden,
    }
  })
}

export function buildPublicPanelEntries(
  achievements: Achievement[],
  t: Translate
): PublicPanelAchievementEntry[] {
  return achievements
    .slice()
    .sort((left, right) => {
      const rewardDiff = right.reward - left.reward
      if (rewardDiff !== 0) {
        return rewardDiff
      }

      const activeDiff = Number(right.active) - Number(left.active)
      if (activeDiff !== 0) {
        return activeDiff
      }

      const visitDiff = right.visits - left.visits
      if (visitDiff !== 0) {
        return visitDiff
      }

      return left.title.localeCompare(right.title)
    })
    .map(achievement => {
      const isHidden = achievement.secret

      return {
        id: achievement.id,
        title: isHidden ? t('achievements.hidden.title') : achievement.title,
        description: isHidden ? t('achievements.hidden.description') : achievement.description,
        avatar: isHidden
          ? '?'
          : achievement.label.trim().charAt(0).toUpperCase() ||
            achievement.title.charAt(0).toUpperCase() ||
            'A',
        image: isHidden ? null : (achievement.image ?? null),
        status: achievement.active ? t('marketplace.active') : t('marketplace.inactive'),
        reward: achievement.reward,
        isHidden,
        isPublic: achievement.public,
        isActive: achievement.active,
      }
    })
}
