import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import { TWITCH_CLIENT_ID } from '../../../config/environment'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type { UserAchievement } from '../../achievements/api/achievementManagement.types'

export interface ChannelInfo {
  name: string
  avatarUrl: string
}

function getErrorMessage(error: unknown, language: Language) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return language === 'fr'
          ? 'La requête du hub viewer est invalide.'
          : 'The viewer hub request is invalid.'
      case 404:
        return language === 'fr'
          ? "Aucun succès n\u2019a été trouvé pour ce compte."
          : 'No achievements were found for this account.'
      case 502:
        return language === 'fr'
          ? 'Le service de succès est actuellement indisponible.'
          : 'The achievement service is currently unavailable.'
      default:
        return language === 'fr'
          ? 'Impossible de charger le hub viewer.'
          : 'Unable to load the viewer hub.'
    }
  }

  return language === 'fr' ? 'Impossible de charger le hub viewer.' : 'Unable to load viewer hub.'
}

export async function fetchChannelInfosForIds(
  channelIds: string[]
): Promise<Record<string, ChannelInfo>> {
  if (!channelIds.length) return {}

  const stored = localStorage.getItem('twitch_tokens')
  if (!stored || !TWITCH_CLIENT_ID) return {}

  let accessToken: string
  try {
    accessToken = (JSON.parse(stored) as { accessToken: string }).accessToken
  } catch {
    return {}
  }

  const query = channelIds.map(id => `id=${encodeURIComponent(id)}`).join('&')
  const res = await fetch(`https://api.twitch.tv/helix/users?${query}`, {
    headers: { Authorization: `Bearer ${accessToken}`, 'Client-Id': TWITCH_CLIENT_ID },
  })

  if (!res.ok) return {}

  const data = (await res.json()) as {
    data: Array<{ id: string; display_name: string; profile_image_url: string }>
  }
  return Object.fromEntries(
    data.data.map(u => [u.id, { name: u.display_name, avatarUrl: u.profile_image_url }])
  )
}

interface UseViewerHubResult {
  achievements: UserAchievement[]
  channelInfoById: Record<string, ChannelInfo>
  isLoading: boolean
  errorMessage: string | null
}

export function useViewerHub(): UseViewerHubResult {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [channelInfoById, setChannelInfoById] = useState<Record<string, ChannelInfo>>({})
  const [isLoading, setIsLoading] = useState(Boolean(user))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setAchievements([])
      setChannelInfoById({})
      setErrorMessage(
        language === 'fr'
          ? 'Connecte-toi pour charger ton hub viewer.'
          : 'Sign in to load your viewer hub.'
      )
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const loadAchievements = async () => {
      try {
        const data = await achievementManagementClient.getUserAchievements(user.userId)

        if (!isMounted) return

        setAchievements(data)
        setErrorMessage(null)

        const uniqueIds = [...new Set(data.map(a => a.channelId).filter(Boolean) as string[])]
        const infos = await fetchChannelInfosForIds(uniqueIds)

        if (isMounted) setChannelInfoById(infos)
      } catch (error) {
        if (!isMounted) return

        setAchievements([])
        setChannelInfoById({})
        setErrorMessage(getErrorMessage(error, language))
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadAchievements()

    return () => {
      isMounted = false
    }
  }, [language, user])

  return useMemo(
    () => ({
      achievements,
      channelInfoById,
      isLoading,
      errorMessage,
    }),
    [achievements, channelInfoById, errorMessage, isLoading]
  )
}
