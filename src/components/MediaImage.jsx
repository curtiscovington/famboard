import { useEffect, useState } from 'react'
import { useMediaLibrary } from '../context/MediaLibraryContext.jsx'

export function MediaImage({ mediaId, variant = 'preview', alt = '', className = '', fallback = null, ...rest }) {
  const { getMediaBlob } = useMediaLibrary()
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!mediaId) {
      setUrl(null)
      return undefined
    }

    let cancelled = false
    let objectUrl = null

    const load = async () => {
      try {
        const blob = await getMediaBlob(mediaId, variant)
        if (cancelled) return
        if (!blob) {
          setUrl(null)
          return
        }
        objectUrl = URL.createObjectURL(blob)
        setUrl(objectUrl)
      } catch (error) {
        console.warn('Unable to load media blob', error)
        if (!cancelled) {
          setUrl(null)
        }
      }
    }

    load()

    return () => {
      cancelled = true
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [mediaId, variant, getMediaBlob])

  if (!mediaId) {
    return fallback
  }

  if (!url) {
    return fallback
  }

  return <img src={url} alt={alt} className={className} {...rest} />
}
