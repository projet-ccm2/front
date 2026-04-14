import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
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
          ? 'La requête du hub viewer est invalide.'
          : 'The viewer hub request is invalid.'
      case 404:
        return language === 'fr'
          ? 'Aucun succès n’a été trouvé pour ce compte.'
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

interface UseViewerHubResult {
  achievements: UserAchievement[]
  isLoading: boolean
  errorMessage: string | null
}

export function useViewerHub(): UseViewerHubResult {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(user))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setAchievements([])
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
  }, [language, user])

  return useMemo(
    () => ({
      achievements,
      isLoading,
      errorMessage,
    }),
    [achievements, errorMessage, isLoading]
  )
}
