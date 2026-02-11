import { useEffect, useState } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { ChannelProvider } from './context/ChannelContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { LandingPage } from './features/landing/LandingPage'
import { Dashboard } from './features/dashboard/Dashboard'
import { AchievementCreator } from './features/achievements/AchievementCreator'
import { SuccessManagement } from './features/achievements/SuccessManagement'
import { Marketplace } from './features/marketplace/Marketplace'
import { UserProfile } from './features/profile/UserProfile'
import { TwitchOverlay } from './features/overlay/TwitchOverlay'

type Screen =
  | 'landing'
  | 'dashboard'
  | 'creator'
  | 'management'
  | 'marketplace'
  | 'profile'
  | 'overlay'

function AppContent() {
  const { isAuthenticated, isLoading, login, completeAuth } = useAuth()
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing')

  useEffect(() => {
    const handleCallback = async () => {
      const hash = globalThis.location.hash
      if (hash && hash.includes('access_token')) {
        const params = new URLSearchParams(hash.substring(1))
        const accessToken = params.get('access_token')
        const idToken = params.get('id_token')
        const tokenType = params.get('token_type')
        const expiresIn = Number(params.get('expires_in'))
        const scope = params.get('scope')?.split(' ') ?? []
        const state = params.get('state') ?? ''

        if (accessToken && idToken) {
          try {
            await completeAuth({
              accessToken,
              idToken,
              tokenType: tokenType ?? 'bearer',
              expiresIn,
              scope,
              state
            })
            // Clean URL
            globalThis.history.replaceState({}, document.title, globalThis.location.pathname)
            setCurrentScreen('dashboard')
          } catch (error) {
            console.error('Auth completion failed', error)
          }
        }
      }
    }

    handleCallback()
  }, [completeAuth])

  const navigateTo = (screen: string) => {
    setCurrentScreen(screen as Screen)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0e0e10] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9146FF]"></div>
      </div>
    )
  }

  if (!isAuthenticated && currentScreen === 'landing') {
    return <LandingPage onConnect={login} />
  }

  // If authenticated but on landing, go to dashboard
  if (isAuthenticated && currentScreen === 'landing') {
    return (
      <ChannelProvider>
        <div className="min-h-screen bg-[#0e0e10] dark:bg-gray-50">
          <Dashboard onNavigate={navigateTo} />
        </div>
      </ChannelProvider>
    )
  }

  return (
    <ChannelProvider>
      <div className="min-h-screen bg-[#0e0e10] dark:bg-gray-50">
        {currentScreen === 'dashboard' && <Dashboard onNavigate={navigateTo} />}
        {currentScreen === 'creator' && <AchievementCreator onNavigate={navigateTo} />}
        {currentScreen === 'management' && <SuccessManagement onNavigate={navigateTo} />}
        {currentScreen === 'marketplace' && <Marketplace onNavigate={navigateTo} />}
        {currentScreen === 'profile' && <UserProfile onNavigate={navigateTo} />}
        {currentScreen === 'overlay' && <TwitchOverlay onNavigate={navigateTo} />}
      </div>
    </ChannelProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
