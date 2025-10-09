import { useEffect, useMemo, useState } from 'react'
import { useFamboard } from '../context/FamboardContext.jsx'

const SAFARI_IOS_MESSAGE = 'Install this app: Tap the Share icon → Add to Home Screen.'
const DEFAULT_MESSAGE = 'Install this app for a better experience.'

const getDisplayModeStandalone = () => {
  if (typeof window === 'undefined') return true
  if (window.matchMedia?.('(display-mode: standalone)')?.matches) {
    return true
  }
  return Boolean(window.navigator?.standalone)
}

const isIosSafari = () => {
  if (typeof navigator === 'undefined') return false

  const userAgent = navigator.userAgent || ''
  const platform = navigator.platform || ''
  const maxTouchPoints = typeof navigator.maxTouchPoints === 'number' ? navigator.maxTouchPoints : 0

  const isiOSLikeDevice = /iphone|ipad|ipod/i.test(userAgent) || (platform === 'MacIntel' && maxTouchPoints > 1)
  if (!isiOSLikeDevice) return false

  const isSafari =
    /safari/i.test(userAgent) &&
    !/crios|fxios|opios|edgios/i.test(userAgent) &&
    !/android/i.test(userAgent)

  return isSafari
}

export function PwaInstallPrompt() {
  const { state, isHydrated, dismissPwaInstallPrompt } = useFamboard()
  const [isStandalone, setIsStandalone] = useState(() => getDisplayModeStandalone())
  const [shouldRender, setShouldRender] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleChange = () => {
      setIsStandalone(getDisplayModeStandalone())
    }

    const media = window.matchMedia?.('(display-mode: standalone)')
    media?.addEventListener?.('change', handleChange)
    media?.addListener?.(handleChange)
    window.addEventListener('appinstalled', handleChange)

    return () => {
      media?.removeEventListener?.('change', handleChange)
      media?.removeListener?.(handleChange)
      window.removeEventListener('appinstalled', handleChange)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated) return undefined
    if (isStandalone) return undefined
    if (state.pwaInstallOptOut) return undefined
    if (typeof window === 'undefined') return undefined

    const timer = window.setTimeout(() => {
      setShouldRender(true)
    }, 2000)

    return () => {
      window.clearTimeout(timer)
    }
  }, [isHydrated, isStandalone, state.pwaInstallOptOut])

  useEffect(() => {
    if (!shouldRender) return undefined
    const frame = window.requestAnimationFrame(() => setIsVisible(true))
    return () => {
      window.cancelAnimationFrame(frame)
    }
  }, [shouldRender])

  const message = useMemo(() => (isIosSafari() ? SAFARI_IOS_MESSAGE : DEFAULT_MESSAGE), [])

  const hidePrompt = (persistPreference = false) => {
    setIsVisible(false)
    window.setTimeout(() => {
      setShouldRender(false)
      if (persistPreference) {
        dismissPwaInstallPrompt()
      }
    }, 250)
  }

  const dismissForSession = () => hidePrompt(false)
  const dismissPermanently = () => hidePrompt(true)

  if (!shouldRender) {
    return null
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-end px-4 sm:bottom-8 sm:px-6"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div
        className={`pointer-events-auto flex max-w-md items-center gap-3 rounded-full bg-white/95 px-4 py-2 text-sm text-slate-700 shadow-lg shadow-slate-900/10 ring-1 ring-black/5 transition-all duration-300 ease-out dark:bg-slate-900/95 dark:text-slate-100 dark:ring-white/10 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
        }`}
        role="status"
        aria-live="polite"
      >
        <span className="text-base" aria-hidden>
          📲
        </span>
        <p className="flex-1 text-left">{message}</p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={dismissForSession}
            className="rounded-full bg-slate-200/80 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-famboard-primary focus:ring-offset-1 dark:bg-slate-700/70 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Maybe later
          </button>
          <button
            type="button"
            onClick={dismissPermanently}
            className="rounded-full bg-famboard-primary/90 px-3 py-1 text-xs font-semibold text-white transition hover:bg-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary focus:ring-offset-1 dark:bg-famboard-accent dark:hover:bg-famboard-accent/90"
          >
            Don’t show again
          </button>
        </div>
      </div>
    </div>
  )
}

export default PwaInstallPrompt
