import { useMemo, useState } from 'react'
import { ChannelSelector } from '../../components/ui/ChannelSelector'
import { Search, Edit, Trash2, Menu, Target, Globe, EyeOff } from 'lucide-react'
import { useChannel } from '../../context/ChannelContext'
import { achievementManagementClient } from './api/achievementManagementClient'
import type { Achievement } from './api/achievementManagement.types'
import { useChannelAchievements } from './hooks/useChannelAchievements'

interface SuccessManagementProps {
  onNavigate: (page: string) => void
  onOpenSidebar: () => void
  onEditAchievement: (achievementId: string) => void
}

type FilterOption =
  | 'All Achievements'
  | 'Enabled Only'
  | 'Disabled Only'
  | 'Public Only'
  | 'Secret Only'

const formatTriggerLabel = (label: string) =>
  label
    .split('_')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

export function SuccessManagement({
  onNavigate,
  onOpenSidebar,
  onEditAchievement,
}: Readonly<SuccessManagementProps>) {
  const { selectedChannel } = useChannel()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterOption>('All Achievements')
  const [overrides, setOverrides] = useState<Record<string, Achievement>>({})
  const [deletedIds, setDeletedIds] = useState<string[]>([])
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [actionError, setActionError] = useState<string | null>(null)
  const { achievements, isLoading, errorMessage } = useChannelAchievements(
    selectedChannel?.id ?? null
  )

  const displayedAchievements = useMemo(
    () =>
      achievements
        .filter(achievement => !deletedIds.includes(achievement.id))
        .map(achievement => overrides[achievement.id] ?? achievement),
    [achievements, deletedIds, overrides]
  )

  const filteredAchievements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return displayedAchievements
      .filter(achievement => {
        if (!normalizedSearch) {
          return true
        }

        return [achievement.title, achievement.description, achievement.type.label]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      })
      .filter(achievement => {
        switch (filter) {
          case 'Enabled Only':
            return achievement.active
          case 'Disabled Only':
            return !achievement.active
          case 'Public Only':
            return achievement.public
          case 'Secret Only':
            return achievement.secret
          case 'All Achievements':
          default:
            return true
        }
      })
  }, [displayedAchievements, filter, search])

  const handleToggleActive = async (achievement: Achievement) => {
    const nextActive = !achievement.active
    const previousAchievement = achievement

    setActionError(null)
    setPendingIds(current => [...current, achievement.id])
    setOverrides(current => ({
      ...current,
      [achievement.id]: {
        ...achievement,
        active: nextActive,
      },
    }))

    try {
      const updatedAchievement = nextActive
        ? await achievementManagementClient.activateAchievement(achievement.id)
        : await achievementManagementClient.deactivateAchievement(achievement.id)

      setOverrides(current => ({
        ...current,
        [achievement.id]: updatedAchievement,
      }))
    } catch {
      setOverrides(current => ({
        ...current,
        [achievement.id]: previousAchievement,
      }))
      setActionError(`Unable to update "${achievement.title}". Please try again.`)
    } finally {
      setPendingIds(current => current.filter(id => id !== achievement.id))
    }
  }

  const handleDelete = async (achievement: Achievement) => {
    const shouldDelete = window.confirm(`Delete "${achievement.title}"?`)

    if (!shouldDelete) {
      return
    }

    setActionError(null)
    setPendingIds(current => [...current, achievement.id])
    setDeletedIds(current => [...current, achievement.id])

    try {
      await achievementManagementClient.deleteAchievement(achievement.id)
      setOverrides(current => {
        const nextOverrides = { ...current }
        delete nextOverrides[achievement.id]
        return nextOverrides
      })
    } catch {
      setDeletedIds(current => current.filter(id => id !== achievement.id))
      setActionError(`Unable to delete "${achievement.title}". Please try again.`)
    } finally {
      setPendingIds(current => current.filter(id => id !== achievement.id))
    }
  }

  return (
    <div className="flex flex-col">
      <div className="flex-1 overflow-auto bg-[#0e0e10] dark:bg-gray-50">
        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <button
                onClick={onOpenSidebar}
                data-testid="mobile-menu-btn"
                className="lg:hidden text-white dark:text-gray-900 flex-shrink-0"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl text-white dark:text-gray-900 mb-2">
                  Manage Achievements
                </h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                  Enable, disable, and edit your quests
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="hidden sm:block">
                <ChannelSelector />
              </div>
              <button
                onClick={() => onNavigate('creator')}
                className="hidden sm:block px-6 py-3 bg-[#9146FF] hover:bg-[#772ce8] text-white rounded-lg transition-colors whitespace-nowrap"
              >
                Create New
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search achievements..."
                className="w-full pl-10 pr-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none placeholder:text-gray-500"
              />
            </div>
            <select
              value={filter}
              onChange={event => setFilter(event.target.value as FilterOption)}
              className="px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none"
            >
              <option>All Achievements</option>
              <option>Enabled Only</option>
              <option>Disabled Only</option>
              <option>Public Only</option>
              <option>Secret Only</option>
            </select>
          </div>
        </div>

        <div className="p-4 sm:p-8">
          {selectedChannel && (
            <div className="mb-4 text-sm text-gray-400 dark:text-gray-600">
              Channel: <span className="text-white dark:text-gray-900">{selectedChannel.name}</span>
            </div>
          )}

          {isLoading && (
            <div className="rounded-xl border border-[#2d2d31] bg-[#18181b] p-6 text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
              Loading channel achievements...
            </div>
          )}

          {!isLoading && errorMessage && (
            <div className="rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-6 text-[#ff8080] dark:text-[#b42318]">
              {errorMessage}
            </div>
          )}

          {!isLoading && !errorMessage && actionError && (
            <div className="mb-4 rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-4 text-[#ff8080] dark:text-[#b42318]">
              {actionError}
            </div>
          )}

          {!isLoading && !errorMessage && filteredAchievements.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#2d2d31] bg-[#18181b] p-8 text-center dark:border-gray-200 dark:bg-white">
              <h2 className="mb-2 text-xl text-white dark:text-gray-900">
                No achievements for this channel
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-600">
                Create your first achievement or adjust the current filters.
              </p>
            </div>
          )}

          {!isLoading && !errorMessage && filteredAchievements.length > 0 && (
            <div className="space-y-4">
              {filteredAchievements.map(achievement => (
                <div
                  key={achievement.id}
                  className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl p-4 sm:p-6 hover:border-[#9146FF] transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-xl flex items-center justify-center text-xl text-white flex-shrink-0 px-2 text-center">
                      {achievement.label || achievement.title.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0 w-full">
                      <div className="flex flex-col sm:flex-row items-start justify-between mb-3 gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-1">
                            {achievement.title}
                          </h3>
                          <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                            {achievement.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            aria-label={`Edit ${achievement.title}`}
                            onClick={() => onEditAchievement(achievement.id)}
                            className="p-2 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-gray-300 dark:text-gray-700 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            aria-label={`Delete ${achievement.title}`}
                            disabled={pendingIds.includes(achievement.id)}
                            onClick={() => void handleDelete(achievement)}
                            className={`p-2 bg-[#ff4444]/20 hover:bg-[#ff4444]/30 text-[#ff4444] rounded-lg transition-colors ${
                              pendingIds.includes(achievement.id)
                                ? 'opacity-60 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 dark:text-gray-600">Reward:</span>
                          <span className="text-[#ffd700]">{achievement.reward} XP</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600">
                          <Target className="w-4 h-4 text-[#00f593]" />
                          <span>{achievement.goal}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600">
                          <Globe className="w-4 h-4" />
                          <span>{achievement.public ? 'Public' : 'Private'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 dark:text-gray-600">
                          <EyeOff className="w-4 h-4" />
                          <span>{achievement.secret ? 'Secret' : 'Visible'}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-400 dark:text-gray-600">
                          Trigger: {formatTriggerLabel(achievement.type.label)}
                        </div>
                        <button
                          aria-label={`${achievement.active ? 'Deactivate' : 'Activate'} ${achievement.title}`}
                          disabled={pendingIds.includes(achievement.id)}
                          onClick={() => void handleToggleActive(achievement)}
                          className={`w-12 h-6 rounded-full transition-colors relative ${
                            achievement.active ? 'bg-[#9146FF]' : 'bg-[#4d4d51]'
                          } ${pendingIds.includes(achievement.id) ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                              achievement.active ? 'translate-x-6' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
