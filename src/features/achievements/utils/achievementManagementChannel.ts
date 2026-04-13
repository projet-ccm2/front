const SYNTHETIC_MODERATOR_CHANNEL_PREFIX = 'mod-'

export function isOwnerAchievementChannelId(channelId: string) {
  return !channelId.startsWith(SYNTHETIC_MODERATOR_CHANNEL_PREFIX)
}

export function getOwnerOnlyAchievementMessage(context: 'creator' | 'channel' | 'dashboard') {
  switch (context) {
    case 'creator':
      return 'Achievement management currently supports only the connected user channel. Moderator channels are not handled yet.'
    case 'dashboard':
      return 'Achievement management currently supports only the connected user channel. Channel metrics stay hidden for moderator channels, but your achievement progress remains visible.'
    case 'channel':
    default:
      return 'Achievement management currently supports only the connected user channel. Moderator channels are not handled yet.'
  }
}
