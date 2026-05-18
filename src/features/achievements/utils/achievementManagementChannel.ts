import type { Language } from '../../../i18n/translations'
import { resolveTranslation } from '../../../i18n/translations'

const SYNTHETIC_MODERATOR_CHANNEL_PREFIX = 'mod-'

export function isOwnerAchievementChannelId(channelId: string) {
  return !channelId.startsWith(SYNTHETIC_MODERATOR_CHANNEL_PREFIX)
}

export function getRealChannelId(channelId: string): string {
  return channelId.startsWith(SYNTHETIC_MODERATOR_CHANNEL_PREFIX)
    ? channelId.slice(SYNTHETIC_MODERATOR_CHANNEL_PREFIX.length)
    : channelId
}

export function getOwnerOnlyAchievementMessage(
  language: Language,
  context: 'creator' | 'channel' | 'dashboard'
) {
  const key =
    context === 'dashboard' ? 'achievement.ownerOnly.dashboard' : 'achievement.ownerOnly.channel'

  return resolveTranslation(language, key)
}
