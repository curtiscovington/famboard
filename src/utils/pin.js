const DEFAULT_PIN_ITERATIONS = 150000

const getCrypto = () => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    return globalThis.crypto
  }
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto
  }
  throw new Error('Secure cryptography APIs are not available in this environment')
}

const bufferToBase64 = (buffer) => {
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    let binary = ''
    const bytes = new Uint8Array(buffer)
    const chunkSize = 0xffff
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize)
      binary += String.fromCharCode(...chunk)
    }
    return window.btoa(binary)
  }

  const nodeBuffer = typeof globalThis !== 'undefined' ? globalThis.Buffer : undefined
  if (nodeBuffer) {
    return nodeBuffer.from(buffer).toString('base64')
  }

  throw new Error('Base64 encoding not supported in this environment')
}

const base64ToBytes = (base64) => {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    const binary = window.atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  const nodeBuffer = typeof globalThis !== 'undefined' ? globalThis.Buffer : undefined
  if (nodeBuffer) {
    return new Uint8Array(nodeBuffer.from(base64, 'base64'))
  }

  throw new Error('Base64 decoding not supported in this environment')
}

const timingSafeEqual = (a, b) => {
  if (a.length !== b.length) {
    return false
  }

  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

export function generatePinSalt(byteLength = 16) {
  const crypto = getCrypto()
  const array = new Uint8Array(byteLength)
  crypto.getRandomValues(array)
  return bufferToBase64(array)
}

export async function derivePinHash(pin, saltBase64, iterations = DEFAULT_PIN_ITERATIONS) {
  if (!pin) {
    throw new Error('PIN is required')
  }

  const crypto = getCrypto()
  if (!crypto.subtle?.importKey) {
    throw new Error('SubtleCrypto API is not available')
  }

  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', encoder.encode(pin), 'PBKDF2', false, [
    'deriveBits',
  ])

  const saltBytes = base64ToBytes(saltBase64)
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )

  return bufferToBase64(derivedBits)
}

export async function verifyPin(pin, stored) {
  if (!stored?.salt || !stored?.hash) {
    return false
  }

  const iterations = Number(stored.iterations) || DEFAULT_PIN_ITERATIONS
  const derived = await derivePinHash(pin, stored.salt, iterations)
  return timingSafeEqual(derived, stored.hash)
}

export { DEFAULT_PIN_ITERATIONS }
