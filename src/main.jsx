import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { FamboardProvider } from './context/FamboardContext.jsx'
import { MediaLibraryProvider } from './context/MediaLibraryContext.jsx'

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
  const swUrl = `${import.meta.env.BASE_URL}sw.js`
  if (typeof window.__famboardUpdateReady === 'undefined') {
    window.__famboardUpdateReady = false
  }
  let shouldReloadAfterUpdate = false
  let isReloading = false
  let pendingUpdateWorker = null

  const notifyUpdateAvailable = (worker) => {
    if (!worker || !navigator.serviceWorker.controller) {
      return
    }

    pendingUpdateWorker = worker
    window.__famboardUpdateReady = true
    window.dispatchEvent(new Event('famboard:sw-update-available'))
  }

  window.addEventListener('famboard:sw-apply-update', () => {
    if (!pendingUpdateWorker) {
      return
    }

    shouldReloadAfterUpdate = true
    window.__famboardUpdateReady = false
    pendingUpdateWorker.postMessage({ type: 'SKIP_WAITING' })
    pendingUpdateWorker = null
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!shouldReloadAfterUpdate || isReloading) return
    if (!navigator.serviceWorker.controller) return
    isReloading = true
    window.location.reload()
  })

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        if (registration.waiting) {
          notifyUpdateAvailable(registration.waiting)
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing
          if (!worker) return

          worker.addEventListener('statechange', () => {
            if (worker.state === 'installed' && navigator.serviceWorker.controller) {
              notifyUpdateAvailable(worker)
            }
          })
        })

        const updateRegistration = () => {
          registration.update().catch((error) => {
            console.warn('Service worker update failed', error)
          })
        }

        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            updateRegistration()
          }
        })

        setInterval(updateRegistration, 60 * 60 * 1000)
      })
      .catch((error) => console.error('Service worker registration failed', error))
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <FamboardProvider>
        <MediaLibraryProvider>
          <App />
        </MediaLibraryProvider>
      </FamboardProvider>
    </BrowserRouter>
  </StrictMode>,
)
