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

function getErrorMessage(error: unknown, language: Language) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return language === 'fr'
          ? 'La requête de marketplace est invalide.'
          : 'The marketplace request is invalid.'
      case 404:
        return language === 'fr'
          ? 'Aucune route de succès publics n’a été trouvée.'
          : 'No public achievements route was found.'
      case 502:
        return language === 'fr'
          ? 'Le service de succès est actuellement indisponible.'
          : 'The achievement service is currently unavailable.'
      default:
        return language === 'fr'
          ? 'Impossible de charger les succès de la marketplace.'
          : 'Unable to load marketplace achievements.'
    }
  }

  return language === 'fr'
    ? 'Impossible de charger les succès de la marketplace.'
    : 'Unable to load marketplace achievements.'
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
