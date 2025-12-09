import { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ChannelProvider } from './context/ChannelContext';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { AchievementCreator } from './components/AchievementCreator';
import { SuccessManagement } from './components/SuccessManagement';
import { Marketplace } from './components/Marketplace';
import { UserProfile } from './components/UserProfile';
import { TwitchOverlay } from './components/TwitchOverlay';

type Screen = 'landing' | 'dashboard' | 'creator' | 'management' | 'marketplace' | 'profile' | 'overlay';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleConnect = () => {
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const navigateTo = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  if (!isAuthenticated && currentScreen === 'landing') {
    return (
      <ThemeProvider>
        <LandingPage onConnect={handleConnect} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}