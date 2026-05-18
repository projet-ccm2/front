import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type { LeaderboardEntry } from '../../achievements/api/achievementManagement.types'

interface UseChannelLeaderboardResult {
  entries: LeaderboardEntry[]
  isLoading: boolean
  errorMessage: string | null
}

function getErrorMessage(error: unknown, language: Language): string {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return language === 'fr'
          ? 'La requête du classement est invalide.'
          : 'The leaderboard request is invalid.'
      case 502:
        return language === 'fr'
          ? 'Le service de classement est actuellement indisponible.'
          : 'The leaderboard service is currently unavailable.'
      default:
        return language === 'fr'
          ? 'Impossible de charger le classement.'
          : 'Unable to load the leaderboard.'
    }
  }

  return language === 'fr'
    ? 'Impossible de charger le classement.'
    : 'Unable to load the leaderboard.'
}

export function useChannelLeaderboard(channelId: string | null): UseChannelLeaderboardResult {
  const { language } = useLanguage()
  const languageRef = useRef(language)
  languageRef.current = language

  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(channelId))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!channelId) {
      setEntries([])
      setErrorMessage(null)
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setErrorMessage(null)

    const loadLeaderboard = async () => {
      try {
        const data = await achievementManagementClient.getChannelLeaderboard(channelId)

        if (!isMounted) {
          return
        }

        setEntries(data)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setEntries([])
        if (error instanceof AchievementManagementError && error.status === 404) {
          setErrorMessage(null)
        } else {
          setErrorMessage(getErrorMessage(error, languageRef.current))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadLeaderboard()

    return () => {
      isMounted = false
    }
  }, [channelId])

  return { entries, isLoading, errorMessage }
}
