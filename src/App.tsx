import { useState, useEffect } from 'react'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LandingPage } from './features/landing/LandingPage'
import { Dashboard } from './features/dashboard/Dashboard'
import { Sidebar } from './components/layout/Sidebar'
import { ThemeProvider } from './context/ThemeContext'
import { ChannelProvider } from './context/ChannelContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LanguageProvider } from './context/LanguageContext'
import { AchievementCreator } from './features/achievements/AchievementCreator'
import { SuccessManagement } from './features/achievements/SuccessManagement'
import { Marketplace } from './features/marketplace/Marketplace'
import { UserProfile } from './features/profile/UserProfile'
import { ViewerHub } from './features/viewer/ViewerHub'
import { DiscordWebhookScreen } from './features/discord/DiscordWebhookScreen'
import { TwitchOverlay } from './features/overlay/TwitchOverlay'
import { PublicTwitchPanel } from './features/overlay/PublicTwitchPanel'
import { TwitchExtensionPanel } from './features/overlay/TwitchExtensionPanel'
import {
  getPublicPanelChannelId,
  getPublicPanelViewerId,
} from './features/overlay/utils/publicPanelLink'
import { isTwitchExtensionPanelPath } from './features/overlay/utils/twitchExtensionLink'
import type { Achievement } from './features/achievements/api/achievementManagement.types'
import { useLanguage } from './context/LanguageContext'
import { Toaster } from './components/ui/sonner'

type Screen =
  | 'landing'
  | 'dashboard'
  | 'creator'
  | 'management'
  | 'marketplace'
  | 'profile'
  | 'viewerHub'
  | 'overlay'
  | 'discord'

export function AppContent() {
  const { isAuthenticated, isLoading, login, completeAuth } = useAuth()
  const { t } = useLanguage()
  const [currentScreen, setCurrentScreen] = useState<Screen>(() =>
    isAuthenticated ? 'dashboard' : 'landing'
  )
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingAchievementId, setEditingAchievementId] = useState<Achievement['id'] | null>(null)
  const [templateAchievement, setTemplateAchievement] = useState<Achievement | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const hash = globalThis.location.hash
      if (hash?.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const idToken = params.get('id_token')
        const tokenType = params.get('token_type')
        const expiresIn = Number(params.get('expires_in'))
        const scope = params.get('scope')?.split(' ') ?? []
        const state = params.get('state') ?? ''

        if (accessToken && idToken) {
          const savedState = sessionStorage.getItem('twitch_auth_state')
          if (!savedState || savedState !== state) {
            console.error('OAuth state mismatch — aborting auth')
            return
          }
          sessionStorage.removeItem('twitch_auth_state')

          try {
            await completeAuth({
              accessToken,
              idToken,
              tokenType: tokenType ?? 'bearer',
              expiresIn,
              scope,
              state,
            })
            // Clean URL
            globalThis.history.replaceState({}, document.title, globalThis.location.pathname)
            setCurrentScreen('dashboard')
            setSidebarOpen(false)
          } catch (error) {
            console.error('Auth completion failed', error)
          }
        }
      }
    }

    handleCallback()
  }, [completeAuth])

  const handleNavigate = (page: string) => {
    if (page !== 'creator') {
      setEditingAchievementId(null)
      setTemplateAchievement(null)
    }
    setCurrentScreen(page as Screen)
    setSidebarOpen(false)
  }

  const handleEditAchievement = (achievementId: Achievement['id']) => {
    setTemplateAchievement(null)
    setEditingAchievementId(achievementId)
    setCurrentScreen('creator')
    setSidebarOpen(false)
  }

  const handleUseAchievementTemplate = (achievement: Achievement) => {
    setEditingAchievementId(null)
    setTemplateAchievement(achievement)
    setCurrentScreen('creator')
    setSidebarOpen(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center">
        <div className="text-[#9146FF] animate-pulse text-xl">{t('app.loading')}</div>
      </div>
    )
  }

  if (!isAuthenticated && currentScreen === 'landing') {
    return <LandingPage onConnect={login} />
  }

  return (
    <>
    <div className="flex h-screen bg-[#0e0e10] text-[#efeff1] dark:bg-gray-50 dark:text-gray-900 overflow-hidden">
      <Sidebar
        currentPage={currentScreen}
        onNavigate={handleNavigate}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <main className="flex-1 overflow-y-auto relative bg-[#0e0e10] dark:bg-white">
        {currentScreen === 'dashboard' && (
          <Dashboard onNavigate={handleNavigate} onOpenSidebar={() => setSidebarOpen(true)} />
        )}
        {currentScreen === 'creator' && (
          <AchievementCreator
            achievementId={editingAchievementId}
            templateAchievement={templateAchievement}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        )}
        {currentScreen === 'management' && (
          <SuccessManagement
            onEditAchievement={handleEditAchievement}
            onNavigate={handleNavigate}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        )}
        {currentScreen === 'marketplace' && (
          <Marketplace
            onOpenSidebar={() => setSidebarOpen(true)}
            onUseTemplate={handleUseAchievementTemplate}
          />
        )}
        {currentScreen === 'profile' && (
          <UserProfile onOpenSidebar={() => setSidebarOpen(true)} />
        )}
        {currentScreen === 'viewerHub' && (
          <ViewerHub onOpenSidebar={() => setSidebarOpen(true)} />
        )}
        {currentScreen === 'overlay' && (
          <TwitchOverlay onOpenSidebar={() => setSidebarOpen(true)} />
        )}
        {currentScreen === 'discord' && (
          <DiscordWebhookScreen onOpenSidebar={() => setSidebarOpen(true)} />
        )}
      </main>
    </div>
    <Toaster />
    </>
  )
}

function App() {
  if (isTwitchExtensionPanelPath(globalThis.location.pathname)) {
    return (
      <ThemeProvider>
        <LanguageProvider>
          <TwitchExtensionPanel />
        </LanguageProvider>
      </ThemeProvider>
    )
  }

  const publicPanelChannelId = getPublicPanelChannelId(globalThis.location.pathname)
  const publicPanelViewerId = getPublicPanelViewerId(globalThis.location.search)

  if (publicPanelChannelId) {
    return (
      <ThemeProvider>
        <LanguageProvider>
          <PublicTwitchPanel channelId={publicPanelChannelId} viewerId={publicPanelViewerId} />
        </LanguageProvider>
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ChannelProvider>
            <ErrorBoundary>
              <AppContent />
            </ErrorBoundary>
          </ChannelProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App
