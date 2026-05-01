import { useEffect, useState } from 'react'
import { TWITCH_CLIENT_ID } from '../../../config/environment'
import type { TwitchCustomReward } from '../../../types/twitch'
import { isOwnerAchievementChannelId } from '../utils/achievementManagementChannel'

export function useTwitchChannelRewards(channelId: string | null): {
  rewards: TwitchCustomReward[]
  isLoading: boolean
  error: boolean
} {
  const [rewards, setRewards] = useState<TwitchCustomReward[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!channelId || !isOwnerAchievementChannelId(channelId)) return

    let isMounted = true
    setIsLoading(true)
    setError(false)

    const stored = localStorage.getItem('twitch_tokens')
    if (!stored || !TWITCH_CLIENT_ID) {
      setIsLoading(false)
      setError(true)
      return
    }

    let accessToken: string
    try {
      accessToken = (JSON.parse(stored) as { accessToken: string }).accessToken
    } catch {
      setIsLoading(false)
      setError(true)
      return
    }

    fetch(
      `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${channelId}`,
      { headers: { Authorization: `Bearer ${accessToken}`, 'Client-Id': TWITCH_CLIENT_ID } }
    )
      .then(res => {
        if (!res.ok) throw new Error()
        return res.json() as Promise<{ data: TwitchCustomReward[] }>
      })
      .then(json => {
        if (isMounted) setRewards(json.data)
      })
      .catch(() => {
        if (isMounted) setError(true)
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [channelId])

  return { rewards, isLoading, error }
}
