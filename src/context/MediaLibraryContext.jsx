import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useFamboard } from './FamboardContext.jsx'
import { generateImageVariants } from '../utils/imageProcessing.js'
import { getMediaBlob, listAllMetadata, persistMediaRecord, removeMediaRecord } from '../utils/mediaStorage.js'

const MediaLibraryContext = createContext(null)

function createMediaId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `media-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeName(fileName, index) {
  if (fileName) return fileName
  const timestamp = new Date()
  const formatted = timestamp.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
  })
  return `Photo ${formatted} ${index > 0 ? `(${index + 1})` : ''}`
}

export function MediaLibraryProvider({ children }) {
  const { state, upsertMediaItem, removeMediaItem } = useFamboard()
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [estimate, setEstimate] = useState({ usage: 0, quota: 0 })

  const refreshEstimate = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.storage?.estimate) {
      setEstimate((prev) => ({ usage: prev.usage ?? 0, quota: prev.quota ?? 0 }))
      return
    }
    try {
      const { usage = 0, quota = 0 } = await navigator.storage.estimate()
      setEstimate({ usage, quota })
    } catch (estimateError) {
      console.warn('Unable to read storage estimate', estimateError)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let cancelled = false

    refreshEstimate()
      .catch((estimateError) => {
        console.warn('Storage estimate failed during startup', estimateError)
      })
      .finally(() => {
        if (!cancelled) setIsReady(true)
      })

    ;(async () => {
      try {
        const stored = await listAllMetadata()
        if (cancelled || stored.length === 0) return
        stored.forEach((item) => upsertMediaItem(item))
      } catch (metadataError) {
        console.warn('Unable to sync media metadata from IndexedDB', metadataError)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [refreshEstimate, upsertMediaItem])

  const addMediaFiles = useCallback(
    async (files, options = {}) => {
      const candidates = Array.from(files || []).filter((file) => file && file.type?.startsWith('image/'))
      if (candidates.length === 0) {
        return []
      }
      setIsProcessing(true)
      setError(null)
      const createdItems = []
      try {
        let index = 0
        for (const file of candidates) {
          const variants = await generateImageVariants(file, options)
          const id = createMediaId()
          const timestamp = new Date().toISOString()
          const metadata = {
            id,
            name: normalizeName(file.name, index),
            createdAt: timestamp,
            updatedAt: timestamp,
            bytes: (variants.original?.size ?? 0) + (variants.preview?.size ?? 0),
            variants: {
              original: {
                width: variants.original?.width ?? 0,
                height: variants.original?.height ?? 0,
                type: variants.original?.type ?? file.type ?? 'image/jpeg',
                size: variants.original?.size ?? file.size,
              },
              preview: {
                width: variants.preview?.width ?? variants.original?.width ?? 0,
                height: variants.preview?.height ?? variants.original?.height ?? 0,
                type:
                  variants.preview?.type ?? variants.original?.type ?? file.type ?? 'image/jpeg',
                size: variants.preview?.size ?? variants.original?.size ?? file.size,
              },
            },
          }

          await persistMediaRecord(metadata, {
            original: variants.original?.blob ?? file,
            preview: variants.preview?.blob ?? variants.original?.blob ?? file,
          })

          upsertMediaItem(metadata)
          createdItems.push(metadata)
          index += 1
        }

        await refreshEstimate()
        return createdItems
      } catch (creationError) {
        console.error('Unable to add media files', creationError)
        setError(creationError)
        throw creationError
      } finally {
        setIsProcessing(false)
      }
    },
    [refreshEstimate, upsertMediaItem],
  )

  const removeMedia = useCallback(
    async (id) => {
      if (!id) return
      const target = state.mediaLibrary.find((item) => item.id === id)
      try {
        await removeMediaRecord(id, target?.variants ? Object.keys(target.variants) : [])
      } catch (removeError) {
        console.warn('Unable to remove media record', removeError)
      }
      removeMediaItem(id)
      await refreshEstimate()
    },
    [refreshEstimate, removeMediaItem, state.mediaLibrary],
  )

  const getBlob = useCallback((id, variant = 'preview') => getMediaBlob(id, variant), [])

  const totalBytes = useMemo(
    () => state.mediaLibrary.reduce((sum, item) => sum + (item.bytes ?? 0), 0),
    [state.mediaLibrary],
  )

  const value = useMemo(
    () => ({
      media: state.mediaLibrary,
      isReady,
      isProcessing,
      error,
      estimate,
      totalBytes,
      refreshEstimate,
      addMediaFiles,
      removeMedia,
      getMediaBlob: getBlob,
    }),
    [
      state.mediaLibrary,
      isReady,
      isProcessing,
      error,
      estimate,
      totalBytes,
      refreshEstimate,
      addMediaFiles,
      removeMedia,
      getBlob,
    ],
  )

  return <MediaLibraryContext.Provider value={value}>{children}</MediaLibraryContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useMediaLibrary() {
  const context = useContext(MediaLibraryContext)
  if (!context) {
    throw new Error('useMediaLibrary must be used within a MediaLibraryProvider')
  }
  return context
}
