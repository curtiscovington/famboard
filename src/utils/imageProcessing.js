const DEFAULT_PREVIEW_MAX = 512
const DEFAULT_ORIGINAL_MAX = 2048

function hasCanvasSupport() {
  if (typeof document === 'undefined') return false
  const canvas = document.createElement('canvas')
  return Boolean(canvas?.getContext?.('2d'))
}

async function loadImageBitmap(file) {
  if (typeof createImageBitmap === 'function') {
    return createImageBitmap(file)
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = (event) => {
      URL.revokeObjectURL(url)
      reject(event)
    }
    image.src = url
  })
}

async function renderToBlob(image, width, height, type, quality) {
  if (!hasCanvasSupport()) {
    return null
  }
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width))
  canvas.height = Math.max(1, Math.round(height))
  const context = canvas.getContext('2d')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Unable to generate image blob'))
        }
      },
      type,
      quality,
    )
  })
}

function pickOutputType(file) {
  const type = file.type?.toLowerCase?.() ?? ''
  if (type === 'image/png' || type === 'image/webp') return type
  return 'image/jpeg'
}

export async function generateImageVariants(file, options = {}) {
  const previewMax = options.previewMax ?? DEFAULT_PREVIEW_MAX
  const originalMax = options.originalMax ?? DEFAULT_ORIGINAL_MAX

  if (typeof window === 'undefined') {
    return {
      original: {
        blob: file,
        width: 0,
        height: 0,
        type: file.type || 'image/jpeg',
        size: file.size,
      },
      preview: {
        blob: file,
        width: 0,
        height: 0,
        type: file.type || 'image/jpeg',
        size: file.size,
      },
    }
  }

  let bitmap
  try {
    bitmap = await loadImageBitmap(file)
  } catch (error) {
    console.warn('Unable to decode image, falling back to original file', error)
    return {
      original: {
        blob: file,
        width: 0,
        height: 0,
        type: file.type || 'image/jpeg',
        size: file.size,
      },
      preview: {
        blob: file,
        width: 0,
        height: 0,
        type: file.type || 'image/jpeg',
        size: file.size,
      },
    }
  }

  const sourceWidth = bitmap.width || bitmap.videoWidth || 0
  const sourceHeight = bitmap.height || bitmap.videoHeight || 0
  const maxDimension = Math.max(sourceWidth, sourceHeight) || 1

  const outputType = pickOutputType(file)

  const originalScale = Math.min(1, originalMax / maxDimension)
  const originalWidth = Math.round(sourceWidth * originalScale || sourceWidth)
  const originalHeight = Math.round(sourceHeight * originalScale || sourceHeight)

  let originalBlob = file
  if (hasCanvasSupport() && originalScale < 1) {
    originalBlob = await renderToBlob(bitmap, originalWidth, originalHeight, outputType, 0.92)
  }

  const previewScale = Math.min(1, previewMax / maxDimension)
  const previewWidth = Math.round(sourceWidth * previewScale || sourceWidth)
  const previewHeight = Math.round(sourceHeight * previewScale || sourceHeight)

  let previewBlob = null
  if (hasCanvasSupport()) {
    previewBlob = await renderToBlob(bitmap, previewWidth, previewHeight, outputType, 0.82)
  }

  if (bitmap.close) {
    try {
      bitmap.close()
    } catch (error) {
      console.warn('Failed to release image bitmap', error)
    }
  }

  if (!previewBlob) {
    previewBlob = originalBlob
  }

  return {
    original: {
      blob: originalBlob,
      width: originalWidth || sourceWidth,
      height: originalHeight || sourceHeight,
      type: originalBlob.type || outputType,
      size: originalBlob.size,
    },
    preview: {
      blob: previewBlob,
      width: previewWidth || sourceWidth,
      height: previewHeight || sourceHeight,
      type: previewBlob.type || outputType,
      size: previewBlob.size,
    },
  }
}
