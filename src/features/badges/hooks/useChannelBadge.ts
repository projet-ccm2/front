import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../../../context/LanguageContext'
import type { Language } from '../../../i18n/translations'
import {
  achievementManagementClient,
  AchievementManagementError,
} from '../../achievements/api/achievementManagementClient'
import type { Badge } from '../../achievements/api/achievementManagement.types'

interface UseChannelBadgeResult {
  badge: Badge | null
  isLoading: boolean
  errorMessage: string | null
  isNotFound: boolean
}

function getErrorMessage(error: unknown, language: Language) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return language === 'fr'
          ? 'La requête du badge de chaîne est invalide.'
          : 'The channel badge request is invalid.'
      case 502:
        return language === 'fr'
          ? 'Le service des badges est actuellement indisponible.'
          : 'The badge service is currently unavailable.'
      default:
        return language === 'fr'
          ? 'Impossible de charger le badge de la chaîne.'
          : 'Unable to load the channel badge.'
    }
  }

  return language === 'fr'
    ? 'Impossible de charger le badge de la chaîne.'
    : 'Unable to load the channel badge.'
}

export function useChannelBadge(channelId: string | null): UseChannelBadgeResult {
  const { language } = useLanguage()
  const languageRef = useRef(language)
  languageRef.current = language

  const [badge, setBadge] = useState<Badge | null>(null)
  const [isLoading, setIsLoading] = useState(Boolean(channelId))
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isNotFound, setIsNotFound] = useState(false)

  useEffect(() => {
    if (!channelId) {
      setBadge(null)
      setErrorMessage(null)
      setIsNotFound(false)
      setIsLoading(false)
      return
    }

    let isMounted = true
    setIsLoading(true)
    setErrorMessage(null)
    setIsNotFound(false)

    const loadBadge = async () => {
      try {
        const data = await achievementManagementClient.getChannelBadge(channelId)

        if (!isMounted) {
          return
        }

        setBadge(data)
      } catch (error) {
        if (!isMounted) {
          return
        }

        setBadge(null)
        if (error instanceof AchievementManagementError && error.status === 404) {
          setIsNotFound(true)
          setErrorMessage(null)
        } else {
          setIsNotFound(false)
          setErrorMessage(getErrorMessage(error, languageRef.current))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadBadge()

    return () => {
      isMounted = false
    }
  }, [channelId])

  return {
    badge,
    isLoading,
    errorMessage,
    isNotFound,
  }
}
