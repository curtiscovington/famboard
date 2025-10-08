import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { FamboardProvider } from './context/FamboardContext.jsx'

const REDIRECT_STORAGE_KEY = 'famboard-redirect'

if (import.meta.env.PROD) {
  let pendingRedirect = null

  try {
    pendingRedirect = sessionStorage.getItem(REDIRECT_STORAGE_KEY)
  } catch (error) {
    console.warn('Unable to read Famboard redirect state', error)
  }

  if (pendingRedirect) {
    try {
      sessionStorage.removeItem(REDIRECT_STORAGE_KEY)
    } catch (error) {
      console.warn('Unable to clear Famboard redirect state', error)
    }

    const base = import.meta.env.BASE_URL || '/'
    const normalizedBase = base.endsWith('/') ? base : `${base}/`
    const sanitizedRedirect = pendingRedirect.startsWith('/')
      ? pendingRedirect.slice(1)
      : pendingRedirect

    window.history.replaceState(null, '', `${normalizedBase}${sanitizedRedirect}`)
  }
}

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker
      .register(swUrl)
      .catch((error) => console.error('Service worker registration failed', error))
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <FamboardProvider>
        <App />
      </FamboardProvider>
    </BrowserRouter>
  </StrictMode>,
)
