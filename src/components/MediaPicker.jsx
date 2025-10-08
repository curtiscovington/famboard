import { useId, useMemo, useRef, useState } from 'react'
import { MediaImage } from './MediaImage.jsx'
import { useMediaLibrary } from '../context/MediaLibraryContext.jsx'

function formatBytes(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / 1024 ** exponent
  return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`
}

export function MediaPicker({
  label = 'Photo',
  description,
  imageId = null,
  imageUrl = '',
  allowUrlInput = true,
  onChange,
}) {
  const { media, addMediaFiles, removeMedia, isProcessing, error, totalBytes, estimate } = useMediaLibrary()
  const [showLibrary, setShowLibrary] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(Boolean(imageUrl))
  const [localError, setLocalError] = useState('')
  const fileInputRef = useRef(null)
  const cameraInputRef = useRef(null)
  const inputId = useId()

  const usageInfo = useMemo(() => {
    const quota = estimate?.quota ?? 0
    const usage = totalBytes
    if (!quota) {
      return {
        label: `${formatBytes(usage)} stored`,
        percent: 0,
      }
    }
    const percent = Math.min(100, Math.round((usage / quota) * 100))
    return {
      label: `${formatBytes(usage)} of ${formatBytes(quota)} used`,
      percent,
    }
  }, [estimate?.quota, totalBytes])

  const handleSelectMedia = (id) => {
    if (!onChange) return
    onChange({ imageId: id, imageUrl: '' })
    setShowLibrary(false)
    setShowUrlInput(false)
  }

  const handleClearSelection = () => {
    if (!onChange) return
    onChange({ imageId: null, imageUrl: '' })
  }

  const handleUrlToggle = () => {
    const next = !showUrlInput
    setShowUrlInput(next)
    if (!next && onChange) {
      onChange({ imageId, imageUrl: '' })
    }
    if (next && onChange) {
      onChange({ imageId: null, imageUrl: imageUrl || '' })
    }
  }

  const handleUrlChange = (event) => {
    if (!onChange) return
    onChange({ imageId: null, imageUrl: event.target.value })
  }

  const handleFileChange = async (event) => {
    const files = event.target.files
    if (!files || files.length === 0) return
    setLocalError('')
    try {
      const created = await addMediaFiles(files)
      if (created[0]) {
        handleSelectMedia(created[0].id)
      }
    } catch (error) {
      console.error('Unable to save photo', error)
      setLocalError('Unable to save photo. Try a smaller image or different format.')
    } finally {
      event.target.value = ''
    }
  }

  const handleRemoveFromLibrary = async (id) => {
    try {
      await removeMedia(id)
      if (imageId === id && onChange) {
        onChange({ imageId: null, imageUrl: '' })
      }
    } catch (error) {
      console.error('Unable to remove photo', error)
      setLocalError('Unable to remove this photo. Please try again.')
    }
  }

  const activePreview = (
    <div className="h-24 w-24 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-800">
      {imageId ? (
        <MediaImage
          mediaId={imageId}
          className="h-full w-full object-cover"
          alt={label}
          fallback={<div className="flex h-full w-full items-center justify-center text-3xl">📷</div>}
        />
      ) : imageUrl ? (
        <img src={imageUrl} alt={label} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-3xl">📷</div>
      )}
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {activePreview}
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</p>
            {description && <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-famboard-primary/40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Capture photo
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-famboard-primary/40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Upload image
            </button>
            <button
              type="button"
              onClick={() => setShowLibrary((prev) => !prev)}
              className="rounded-full border border-famboard-primary/40 bg-famboard-primary/10 px-3 py-1.5 text-xs font-semibold text-famboard-primary transition hover:bg-famboard-primary/20 focus:outline-none focus:ring-2 focus:ring-famboard-primary/40"
            >
              {showLibrary ? 'Hide saved photos' : 'Choose from library'}
            </button>
            {(imageId || imageUrl) && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="rounded-full border border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300/70"
              >
                Remove photo
              </button>
            )}
            {allowUrlInput && (
              <button
                type="button"
                onClick={handleUrlToggle}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300/60 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {showUrlInput ? 'Hide link' : 'Use a link'}
              </button>
            )}
          </div>
        </div>
      </div>

      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} multiple />

      {showUrlInput && allowUrlInput && (
        <div className="space-y-1">
          <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Image link
          </label>
          <input
            id={inputId}
            value={imageUrl}
            onChange={handleUrlChange}
            placeholder="https://example.com/photo.jpg"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-inner focus:border-famboard-primary focus:outline-none focus:ring-2 focus:ring-famboard-primary/40 dark:border-slate-700 dark:bg-slate-900"
          />
          <p className="text-xs text-slate-400 dark:text-slate-500">Links are not stored offline. Upload a photo for offline use.</p>
        </div>
      )}

      {showLibrary && (
        <div className="space-y-3 rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-200">
              Saved photos <span className="text-xs font-normal text-slate-400">({media.length})</span>
            </p>
            <button
              type="button"
              onClick={() => setShowLibrary(false)}
              className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300/60 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
          {media.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-100/60 px-4 py-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
              No saved photos yet. Capture or upload a new picture to get started.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {media.map((item) => (
                <div
                  key={item.id}
                  className={`group relative overflow-hidden rounded-2xl border ${
                    item.id === imageId
                      ? 'border-famboard-primary bg-famboard-primary/10'
                      : 'border-slate-200 bg-white/70 dark:border-slate-700 dark:bg-slate-900/80'
                  } p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <button
                    type="button"
                    onClick={() => handleSelectMedia(item.id)}
                    className="block"
                  >
                    <div className="h-28 w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800">
                      <MediaImage
                        mediaId={item.id}
                        className="h-full w-full object-cover"
                        alt={item.name}
                        fallback={<div className="flex h-full w-full items-center justify-center text-2xl">🖼️</div>}
                      />
                    </div>
                    <div className="mt-2 space-y-1 text-left">
                      <p className="text-xs font-semibold text-slate-600 line-clamp-1 dark:text-slate-200">{item.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{formatBytes(item.bytes)}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveFromLibrary(item.id)}
                    className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-rose-500 shadow hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-300/70"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2 rounded-2xl bg-slate-100/70 p-3 text-xs text-slate-500 shadow-inner dark:bg-slate-800/60 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span>Storage</span>
              <span className="font-semibold text-slate-600 dark:text-slate-200">{usageInfo.label}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-famboard-primary transition-all"
                style={{ width: `${usageInfo.percent}%` }}
              />
            </div>
            {usageInfo.percent >= 85 && (
              <p className="text-[11px] font-medium text-amber-600 dark:text-amber-300">
                Storage is getting full. Delete photos you no longer need to free up space.
              </p>
            )}
          </div>
        </div>
      )}

      {(localError || error) && (
        <p className="text-xs font-semibold text-rose-500">
          {localError || error?.message || 'Something went wrong while managing photos.'}
        </p>
      )}

      {isProcessing && (
        <p className="text-xs text-slate-500 dark:text-slate-400">Processing photos… Please wait.</p>
      )}
    </div>
  )
}
