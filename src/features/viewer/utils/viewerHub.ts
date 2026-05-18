import type { UserAchievement } from '../../achievements/api/achievementManagement.types'

export interface ViewerChannelSummary {
  channelId: string
  totalAchievements: number
  unlockedAchievements: number
  inProgressAchievements: number
  hiddenAchievements: number
  xp: number
  achievements: UserAchievement[]
}

export function buildViewerChannelSummaries(
  achievements: UserAchievement[]
): ViewerChannelSummary[] {
  const grouped = new Map<string, UserAchievement[]>()

  for (const achievement of achievements) {
    const channelId = achievement.channelId?.trim() || 'unknown'
    const current = grouped.get(channelId) ?? []
    current.push(achievement)
    grouped.set(channelId, current)
  }

  return Array.from(grouped.entries())
    .map(([channelId, channelAchievements]) => {
      const unlockedAchievements = channelAchievements.filter(
        achievement => achievement.userState.finished
      ).length
      const inProgressAchievements = channelAchievements.filter(
        achievement => !achievement.userState.finished && achievement.userState.progressCount > 0
      ).length
      const hiddenAchievements = channelAchievements.filter(
        achievement => achievement.secret && !achievement.userState.finished
      ).length
      const xp = channelAchievements.reduce(
        (total, achievement) => total + (achievement.userState.finished ? achievement.reward : 0),
        0
      )

      return {
        channelId,
        totalAchievements: channelAchievements.length,
        unlockedAchievements,
        inProgressAchievements,
        hiddenAchievements,
        xp,
        achievements: channelAchievements,
      }
    })
    .sort((left, right) => {
      const unlockedDiff = right.unlockedAchievements - left.unlockedAchievements
      if (unlockedDiff !== 0) {
        return unlockedDiff
      }

      const xpDiff = right.xp - left.xp
      if (xpDiff !== 0) {
        return xpDiff
      }

      const totalDiff = right.totalAchievements - left.totalAchievements
      if (totalDiff !== 0) {
        return totalDiff
      }

      return left.channelId.localeCompare(right.channelId)
    })
}
