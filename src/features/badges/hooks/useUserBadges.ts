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

const USER_BADGE_FALLBACK_MESSAGES: Record<Language, string> = {
  fr: 'Impossible de charger les badges du compte.',
  en: 'Unable to load account badges.',
}

const USER_BADGE_ERROR_MESSAGES: Record<number, Record<Language, string>> = {
  400: {
    fr: 'La requête des badges utilisateur est invalide.',
    en: 'The user badges request is invalid.',
  },
  404: {
    fr: 'Aucun badge n’a été trouvé pour ce compte.',
    en: 'No badges were found for this account.',
  },
  502: {
    fr: 'Le service des badges est actuellement indisponible.',
    en: 'The badge service is currently unavailable.',
  },
}

function getErrorMessage(error: unknown, language: Language) {
  if (!(error instanceof AchievementManagementError)) {
    return USER_BADGE_FALLBACK_MESSAGES[language]
  }

  return USER_BADGE_ERROR_MESSAGES[error.status]?.[language] ?? USER_BADGE_FALLBACK_MESSAGES[language]
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
