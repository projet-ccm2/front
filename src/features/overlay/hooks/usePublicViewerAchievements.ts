import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type { UserAchievement } from '../../achievements/api/achievementManagement.types'

const PUBLIC_VIEWER_FALLBACK_MESSAGES: Record<Language, string> = {
  fr: 'Impossible de charger les succès du viewer.',
  en: 'Unable to load viewer achievements.',
}

const PUBLIC_VIEWER_ERROR_MESSAGES: Record<number, Record<Language, string>> = {
  400: {
    fr: 'La requête du viewer est invalide.',
    en: 'The viewer request is invalid.',
  },
  404: {
    fr: 'Aucune progression de succès n’a été trouvée pour ce viewer.',
    en: 'No achievement progress was found for this viewer.',
  },
  502: {
    fr: 'Le service de succès est actuellement indisponible.',
    en: 'The achievement service is currently unavailable.',
  },
}

function getErrorMessage(error: unknown, language: Language) {
  if (!(error instanceof AchievementManagementError)) {
    return PUBLIC_VIEWER_FALLBACK_MESSAGES[language]
  }

  return PUBLIC_VIEWER_ERROR_MESSAGES[error.status]?.[language] ?? PUBLIC_VIEWER_FALLBACK_MESSAGES[language]
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
