import { useEffect, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../api/achievementManagementClient'
import type { Achievement } from '../api/achievementManagement.types'
import {
  getOwnerOnlyAchievementMessage,
  isOwnerAchievementChannelId,
} from '../utils/achievementManagementChannel'

interface UseChannelAchievementsResult {
  achievements: Achievement[]
  isLoading: boolean
  errorMessage: string | null
}

function getErrorMessage(error: unknown, language: Language) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return language === 'fr'
          ? 'La chaîne sélectionnée ne peut pas être interrogée avec cette requête.'
          : 'The selected channel cannot be queried with the current request.'
      case 404:
        return language === 'fr'
          ? 'Aucun succès n’a été trouvé pour cette chaîne.'
          : 'No achievements were found for this channel.'
      case 502:
        return language === 'fr'
          ? 'Le service de succès est actuellement indisponible.'
          : 'The achievement service is currently unavailable.'
      default:
        return language === 'fr'
          ? 'Impossible de charger les succès de la chaîne.'
          : 'Unable to load channel achievements.'
    }
  }

  return language === 'fr'
    ? 'Impossible de charger les succès de la chaîne.'
    : 'Unable to load channel achievements.'
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

    if (!isOwnerAchievementChannelId(channelId)) {
      setAchievements([])
      setErrorMessage(getOwnerOnlyAchievementMessage(language, 'channel'))
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)

    const loadAchievements = async () => {
      try {
        const data = await achievementManagementClient.getChannelAchievements(channelId)

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
  }
}
