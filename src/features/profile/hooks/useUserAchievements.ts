import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { useChannel } from '../../../context/ChannelContext'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type { UserAchievement } from '../../achievements/api/achievementManagement.types'
import { isOwnerAchievementChannelId } from '../../achievements/utils/achievementManagementChannel'

interface UseUserAchievementsResult {
  achievements: UserAchievement[]
  isLoading: boolean
  errorMessage: string | null
}

const USER_ACHIEVEMENT_FALLBACK_MESSAGES: Record<Language, string> = {
  fr: 'Impossible de charger les succès du profil.',
  en: 'Unable to load profile achievements.',
}

const USER_ACHIEVEMENT_ERROR_MESSAGES: Record<number, Record<Language, string>> = {
  400: {
    fr: 'La requête du profil est invalide.',
    en: 'The current profile request is invalid.',
  },
  404: {
    fr: 'Aucune progression de succès n’a été trouvée pour ce profil.',
    en: 'No achievement progress was found for this profile.',
  },
  502: {
    fr: 'Le service de succès est actuellement indisponible.',
    en: 'The achievement service is currently unavailable.',
  },
}

function getErrorMessage(error: unknown, language: Language) {
  if (!(error instanceof AchievementManagementError)) {
    return USER_ACHIEVEMENT_FALLBACK_MESSAGES[language]
  }

  return (
    USER_ACHIEVEMENT_ERROR_MESSAGES[error.status]?.[language] ??
    USER_ACHIEVEMENT_FALLBACK_MESSAGES[language]
  )
}

export function useUserAchievements(): UseUserAchievementsResult {
  const { user } = useAuth()
  const { selectedChannel } = useChannel()
  const { language } = useLanguage()
  const [achievements, setAchievements] = useState<UserAchievement[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(user))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      setAchievements([])
      setErrorMessage(
        language === 'fr'
          ? 'Connecte-toi pour charger les succès du profil.'
          : 'Sign in to load profile achievements.'
      )
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const loadAchievements = async () => {
      try {
        const data =
          selectedChannel && isOwnerAchievementChannelId(selectedChannel.id)
            ? await achievementManagementClient.getUserChannelAchievements(
                user.userId,
                selectedChannel.id
              )
            : await achievementManagementClient.getUserAchievements(user.userId)

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
  }, [selectedChannel, user, language])

  return {
    achievements,
    isLoading,
    errorMessage,
  }
}
