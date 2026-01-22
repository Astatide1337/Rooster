import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@/components/providers/theme-provider'
import './globals.css'
import App from './App.jsx'

// 🐓 Console Easter Egg - Feed the Rooster game!
// Loaded lazily to avoid bloating the main bundle
if (typeof window !== 'undefined') {
  setTimeout(() => {
    import('./lib/roosterGame').catch(console.error)
  }, 2000)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="rooster-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>,
)
