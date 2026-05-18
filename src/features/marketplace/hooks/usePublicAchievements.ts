import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type { Achievement } from '../../achievements/api/achievementManagement.types'

interface UsePublicAchievementsResult {
  achievements: Achievement[]
  isLoading: boolean
  errorMessage: string | null
}

const PUBLIC_ACHIEVEMENT_FALLBACK_MESSAGES: Record<Language, string> = {
  fr: 'Impossible de charger les succès de la marketplace.',
  en: 'Unable to load marketplace achievements.',
}

const PUBLIC_ACHIEVEMENT_ERROR_MESSAGES: Record<number, Record<Language, string>> = {
  400: {
    fr: 'La requête de marketplace est invalide.',
    en: 'The marketplace request is invalid.',
  },
  404: {
    fr: 'Aucune route de succès publics n’a été trouvée.',
    en: 'No public achievements route was found.',
  },
  502: {
    fr: 'Le service de succès est actuellement indisponible.',
    en: 'The achievement service is currently unavailable.',
  },
}

function getErrorMessage(error: unknown, language: Language) {
  if (!(error instanceof AchievementManagementError)) {
    return PUBLIC_ACHIEVEMENT_FALLBACK_MESSAGES[language]
  }

  return (
    PUBLIC_ACHIEVEMENT_ERROR_MESSAGES[error.status]?.[language] ??
    PUBLIC_ACHIEVEMENT_FALLBACK_MESSAGES[language]
  )
}

export function usePublicAchievements(): UsePublicAchievementsResult {
  const { language } = useLanguage()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadAchievements = async () => {
      try {
        const data = await achievementManagementClient.getPublicAchievements()

        if (!isMounted) {
          return
        }

        setAchievements(data)
        setErrorMessage(null)
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
  }, [language])

  return {
    achievements,
    isLoading,
    errorMessage,
  }
}
