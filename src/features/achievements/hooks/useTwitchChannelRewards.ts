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

    const loadRewards = async () => {
      setIsLoading(true)
      setError(false)

      const stored = localStorage.getItem('twitch_tokens')
      if (!stored || !TWITCH_CLIENT_ID) {
        if (isMounted) {
          setIsLoading(false)
          setError(true)
        }
        return
      }

      let accessToken: string
      try {
        accessToken = (JSON.parse(stored) as { accessToken: string }).accessToken
      } catch {
        if (isMounted) {
          setIsLoading(false)
          setError(true)
        }
        return
      }

      try {
        const response = await fetch(
          `https://api.twitch.tv/helix/channel_points/custom_rewards?broadcaster_id=${channelId}`,
          { headers: { Authorization: `Bearer ${accessToken}`, 'Client-Id': TWITCH_CLIENT_ID } }
        )

        if (!response.ok) {
          throw new Error()
        }

        const json = (await response.json()) as { data: TwitchCustomReward[] }
        if (isMounted) {
          setRewards(json.data)
        }
      } catch {
        if (isMounted) {
          setError(true)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadRewards()

    return () => {
      isMounted = false
    }
  }, [channelId])

  return { rewards, isLoading, error }
}
