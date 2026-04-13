import { useEffect, useState } from 'react'
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

function getErrorMessage(error: unknown) {
  if (error instanceof AchievementManagementError) {
    switch (error.status) {
      case 400:
        return 'The marketplace request is invalid.'
      case 404:
        return 'No public achievements route was found.'
      case 502:
        return 'The achievement service is currently unavailable.'
      default:
        return 'Unable to load marketplace achievements.'
    }
  }

  return 'Unable to load marketplace achievements.'
}

export function usePublicAchievements(): UsePublicAchievementsResult {
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
        setErrorMessage(getErrorMessage(error))
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
  }, [])

  return {
    achievements,
    isLoading,
    errorMessage,
  }
}
