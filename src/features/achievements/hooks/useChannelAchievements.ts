import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../api/achievementManagementClient'
import type { Achievement } from '../api/achievementManagement.types'
import {
  getRealChannelId,
  isOwnerAchievementChannelId,
} from '../utils/achievementManagementChannel'

interface UseChannelAchievementsResult {
  achievements: Achievement[]
  isLoading: boolean
  errorMessage: string | null
  isModeratorChannel: boolean
}

const CHANNEL_ACHIEVEMENT_FALLBACK_MESSAGES: Record<Language, string> = {
  fr: 'Impossible de charger les succès de la chaîne.',
  en: 'Unable to load channel achievements.',
}

const CHANNEL_ACHIEVEMENT_ERROR_MESSAGES: Record<number, Record<Language, string>> = {
  400: {
    fr: 'La chaîne sélectionnée ne peut pas être interrogée avec cette requête.',
    en: 'The selected channel cannot be queried with the current request.',
  },
  404: {
    fr: 'Aucun succès n’a été trouvé pour cette chaîne.',
    en: 'No achievements were found for this channel.',
  },
  502: {
    fr: 'Le service de succès est actuellement indisponible.',
    en: 'The achievement service is currently unavailable.',
  },
}

function getErrorMessage(error: unknown, language: Language) {
  if (!(error instanceof AchievementManagementError)) {
    return CHANNEL_ACHIEVEMENT_FALLBACK_MESSAGES[language]
  }

  return (
    CHANNEL_ACHIEVEMENT_ERROR_MESSAGES[error.status]?.[language] ??
    CHANNEL_ACHIEVEMENT_FALLBACK_MESSAGES[language]
  )
}

export function useChannelAchievements(channelId: string | null): UseChannelAchievementsResult {
  const { language } = useLanguage()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(channelId))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!channelId) {
      setAchievements([])
      setErrorMessage(
        language === 'fr'
          ? 'Sélectionne une chaîne pour charger les succès.'
          : 'Select a channel to load achievements.'
      )
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const loadAchievements = async () => {
      try {
        const data = await achievementManagementClient.getChannelAchievements(
          getRealChannelId(channelId)
        )

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
  }, [channelId, language])

  return {
    achievements,
    isLoading,
    errorMessage,
    isModeratorChannel: channelId !== null && !isOwnerAchievementChannelId(channelId),
  }
}
