import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type { UserAchievement } from '../../achievements/api/achievementManagement.types'

function getErrorMessage(error: unknown, language: Language) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return language === 'fr'
          ? 'La requête du viewer est invalide.'
          : 'The viewer request is invalid.'
      case 404:
        return language === 'fr'
          ? 'Aucune progression de succès n’a été trouvée pour ce viewer.'
          : 'No achievement progress was found for this viewer.'
      case 502:
        return language === 'fr'
          ? 'Le service de succès est actuellement indisponible.'
          : 'The achievement service is currently unavailable.'
      default:
        return language === 'fr'
          ? 'Impossible de charger les succès du viewer.'
          : 'Unable to load viewer achievements.'
    }
  }

  return language === 'fr'
    ? 'Impossible de charger les succès du viewer.'
    : 'Unable to load viewer achievements.'
}

export function usePublicViewerAchievements(channelId: string, viewerId: string | null) {
  const { language } = useLanguage()
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(viewerId))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!viewerId) {
      setAchievements([])
      setErrorMessage(null)
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setErrorMessage(null)

    const loadAchievements = async () => {
      try {
        const data = await achievementManagementClient.getUserChannelAchievements(
          viewerId,
          channelId
        )

        if (!isMounted) {
          return
        }

        setAchievements(data)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setAchievements([])
        setErrorMessage(getErrorMessage(error, language))
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadAchievements()

    return () => {
      isMounted = false
    }
  }, [channelId, language, viewerId])

  return {
    achievements,
    isLoading,
    errorMessage,
  }
}
