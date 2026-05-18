import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { TwitchExtensionPanel } from './features/overlay/TwitchExtensionPanel'
import './index.css'

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(
    <ThemeProvider>
      <LanguageProvider>
        <TwitchExtensionPanel />
      </LanguageProvider>
    </ThemeProvider>
  )
}
