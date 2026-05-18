import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type { Badge } from '../../achievements/api/achievementManagement.types'

interface UseUserBadgesResult {
  badges: Badge[]
  isLoading: boolean
  errorMessage: string | null
}

function getErrorMessage(error: unknown, language: Language) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return language === 'fr'
          ? 'La requête des badges utilisateur est invalide.'
          : 'The user badges request is invalid.'
      case 404:
        return language === 'fr'
          ? 'Aucun badge n’a été trouvé pour ce compte.'
          : 'No badges were found for this account.'
      case 502:
        return language === 'fr'
          ? 'Le service des badges est actuellement indisponible.'
          : 'The badge service is currently unavailable.'
      default:
        return language === 'fr'
          ? 'Impossible de charger les badges du compte.'
          : 'Unable to load account badges.'
    }
  }

  return language === 'fr'
    ? 'Impossible de charger les badges du compte.'
    : 'Unable to load account badges.'
}

export function useUserBadges(userId: string | null): UseUserBadgesResult {
  const { language } = useLanguage()
  const languageRef = useRef(language)
  languageRef.current = language

  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(userId))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setBadges([])
      setErrorMessage(null)
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setErrorMessage(null)

    const loadBadges = async () => {
      try {
        const data = await achievementManagementClient.getUserBadges(userId)

        if (!isMounted) {
          return
        }

        setBadges(data)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setBadges([])
        setErrorMessage(getErrorMessage(error, languageRef.current))
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadBadges()

    return () => {
      isMounted = false
    }
  }, [userId])

  return {
    badges,
    isLoading,
    errorMessage,
  }
}
