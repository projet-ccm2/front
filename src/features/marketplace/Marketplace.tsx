import { useMemo, useState } from 'react'
import { ChannelSelector } from '../../components/ui/ChannelSelector'
import { Search, Download, Filter, Menu, X, Plus, Eye, Target } from 'lucide-react'
import { usePublicAchievements } from './hooks/usePublicAchievements'
import type { Achievement } from '../achievements/api/achievementManagement.types'

interface MarketplaceProps {
  readonly onUseTemplate: (achievement: Achievement) => void
  readonly onOpenSidebar: () => void
}

type SortOption = 'Most Downloaded' | 'Most Visited' | 'Highest Reward' | 'Newest Available'

const SORT_OPTIONS: SortOption[] = [
  'Most Downloaded',
  'Most Visited',
  'Highest Reward',
  'Newest Available',
]

const formatTriggerLabel = (label: string) =>
  label
    .split('_')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ')

const getVisibilityBadgeClassName = (isSecret: boolean) => {
  if (isSecret) {
    return 'bg-[#ff4444]/20 text-[#ff4444]'
  }

  return 'bg-[#00f593]/20 text-[#00f593]'
}

export function Marketplace({ onOpenSidebar, onUseTemplate }: MarketplaceProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showSecretOnly, setShowSecretOnly] = useState(false)
  const [showActiveOnly, setShowActiveOnly] = useState(false)
  const [sortBy, setSortBy] = useState<SortOption>('Most Downloaded')
  const { achievements, isLoading, errorMessage } = usePublicAchievements()

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(achievements.map(achievement => formatTriggerLabel(achievement.type.label)))
    )

    return ['All', ...uniqueCategories]
  }, [achievements])

  const filteredAchievements = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return [...achievements]
      .filter(achievement => {
        if (selectedCategory !== 'All') {
          return formatTriggerLabel(achievement.type.label) === selectedCategory
        }

        return true
      })
      .filter(achievement => {
        if (!normalizedSearch) {
          return true
        }

        return [achievement.title, achievement.description, achievement.type.label]
          .join(' ')
          .toLowerCase()
          .includes(normalizedSearch)
      })
      .filter(achievement => (showSecretOnly ? achievement.secret : true))
      .filter(achievement => (showActiveOnly ? achievement.active : true))
      .sort((left, right) => {
        switch (sortBy) {
          case 'Most Visited':
            return right.visits - left.visits
          case 'Highest Reward':
            return right.reward - left.reward
          case 'Newest Available': {
            if (right.active === left.active) return 0
            return right.active ? -1 : 1
          }
          case 'Most Downloaded':
          default:
            return right.downloads - left.downloads
        }
      })
  }, [achievements, search, selectedCategory, showSecretOnly, showActiveOnly, sortBy])

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
                  Community Marketplace
                </h1>
                <p className="text-gray-400 dark:text-gray-600 text-sm sm:text-base">
                  Discover and add achievements created by the community
                </p>
              </div>
            </div>

            <div className="relative hidden sm:block flex-shrink-0">
              <ChannelSelector />
            </div>
          </div>
        </div>

        <div className="bg-[#18181b] dark:bg-white border-b border-[#2d2d31] dark:border-gray-200 px-4 sm:px-8 py-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Find new quests for your community..."
                className="w-full pl-10 pr-4 py-3 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none placeholder:text-gray-500"
              />
            </div>
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              data-testid="mobile-filter-btn"
              className="lg:hidden px-4 py-3 bg-[#2d2d31] dark:bg-gray-100 hover:bg-[#3d3d41] dark:hover:bg-gray-200 text-white dark:text-gray-900 rounded-lg transition-colors"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex">
          <div
            className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-[#18181b] dark:bg-white border-r border-[#2d2d31] dark:border-gray-200 p-6 overflow-y-auto transition-transform duration-300 ${
              filtersOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="lg:hidden flex justify-end mb-4">
              <button
                onClick={() => setFiltersOpen(false)}
                data-testid="close-filters-btn"
                className="text-gray-400 dark:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-white dark:text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors text-sm ${
                    category === selectedCategory
                      ? 'bg-[#9146FF] text-white'
                      : 'text-gray-400 dark:text-gray-600 hover:bg-[#2d2d31] dark:hover:bg-gray-100 hover:text-white dark:hover:text-gray-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-white dark:text-gray-900 mb-4">Visibility</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={showActiveOnly}
                    onChange={event => setShowActiveOnly(event.target.checked)}
                    className="w-4 h-4 rounded border-[#4d4d51] dark:border-gray-300 bg-[#2d2d31] dark:bg-gray-100 text-[#9146FF] focus:ring-[#9146FF]"
                  />
                  <span className="text-gray-400 dark:text-gray-600">Active only</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={showSecretOnly}
                    onChange={event => setShowSecretOnly(event.target.checked)}
                    className="w-4 h-4 rounded border-[#4d4d51] dark:border-gray-300 bg-[#2d2d31] dark:bg-gray-100 text-[#9146FF] focus:ring-[#9146FF]"
                  />
                  <span className="text-gray-400 dark:text-gray-600">Secret only</span>
                </label>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-white dark:text-gray-900 mb-4">Sort By</h3>
              <select
                value={sortBy}
                onChange={event => setSortBy(event.target.value as SortOption)}
                className="w-full px-4 py-2 bg-[#2d2d31] dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg border border-transparent focus:border-[#9146FF] focus:outline-none text-sm"
              >
                {SORT_OPTIONS.map(option => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          {filtersOpen && (
            <button
              type="button"
              className="fixed inset-0 bg-black/50 z-20 lg:hidden w-full h-full cursor-default"
              onClick={() => setFiltersOpen(false)}
              aria-label="Close filters"
            />
          )}

          <div className="flex-1 p-4 sm:p-8">
            {isLoading && (
              <div className="rounded-xl border border-[#2d2d31] bg-[#18181b] p-6 text-gray-400 dark:border-gray-200 dark:bg-white dark:text-gray-600">
                Loading public achievements...
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="rounded-xl border border-[#ff4444]/40 bg-[#ff4444]/10 p-6 text-[#ff8080] dark:text-[#b42318]">
                {errorMessage}
              </div>
            )}

            {!isLoading && !errorMessage && filteredAchievements.length === 0 && (
              <div className="rounded-xl border border-dashed border-[#2d2d31] bg-[#18181b] p-8 text-center dark:border-gray-200 dark:bg-white">
                <h2 className="mb-2 text-xl text-white dark:text-gray-900">
                  No public achievements found
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-600">
                  Adjust your filters or wait for new marketplace templates to be published.
                </p>
              </div>
            )}

            {!isLoading && !errorMessage && filteredAchievements.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredAchievements.map(achievement => (
                  <div
                    key={achievement.id}
                    className="bg-[#18181b] dark:bg-white border border-[#2d2d31] dark:border-gray-200 rounded-xl overflow-hidden hover:border-[#9146FF] transition-colors"
                  >
                    <div className="p-4 sm:p-6 border-b border-[#2d2d31] dark:border-gray-200">
                      <div className="flex items-start justify-between mb-4 gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#9146FF] to-[#772ce8] rounded-xl flex items-center justify-center text-xl text-white text-center px-2">
                          {achievement.label || achievement.title.slice(0, 2).toUpperCase()}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs ${getVisibilityBadgeClassName(
                            achievement.secret
                          )}`}
                        >
                          {achievement.secret ? 'Secret' : 'Visible'}
                        </div>
                      </div>
                      <h3 className="text-lg sm:text-xl text-white dark:text-gray-900 mb-2">
                        {achievement.title}
                      </h3>
                      <p className="text-gray-400 dark:text-gray-600 text-sm mb-4 min-h-10">
                        {achievement.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-600">
                          <Download className="w-4 h-4" />
                          <span>{achievement.downloads}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-400 dark:text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span>{achievement.visits}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[#ffd700]">
                          <Target className="w-4 h-4" />
                          <span>{achievement.goal}</span>
                        </div>
                        <div className="text-[#ffd700]">{achievement.reward} XP</div>
                      </div>
                    </div>

                    <div className="p-4 bg-[#1a1a1d] dark:bg-gray-50">
                      <div className="flex items-center justify-between mb-3 text-xs">
                        <span className="text-gray-400 dark:text-gray-600">
                          {formatTriggerLabel(achievement.type.label)}
                        </span>
                        <span
                          className={
                            achievement.active
                              ? 'text-[#00f593]'
                              : 'text-gray-500 dark:text-gray-500'
                          }
                        >
                          {achievement.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <button
                        onClick={() => onUseTemplate(achievement)}
                        className="w-full px-4 py-2 bg-[#9146FF] hover:bg-[#772ce8] text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Use as Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
