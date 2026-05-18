import { createRoot } from 'react-dom/client'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import { TwitchExtensionConfig } from './features/overlay/TwitchExtensionConfig'
import './index.css'

const root = document.getElementById('root')

if (root) {
  createRoot(root).render(
    <ThemeProvider>
      <LanguageProvider>
        <TwitchExtensionConfig />
      </LanguageProvider>
    </ThemeProvider>
  )
}
