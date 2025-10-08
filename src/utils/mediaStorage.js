import { openDB } from 'idb'

const DB_NAME = 'famboard-media-store'
const DB_VERSION = 1
const META_STORE = 'media'
const BLOBS_STORE = 'mediaBlobs'

let dbPromise = null

const isClient = typeof window !== 'undefined'

function getDb() {
  if (!isClient) return null
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(META_STORE)) {
          const store = db.createObjectStore(META_STORE, { keyPath: 'id' })
          store.createIndex('createdAt', 'createdAt', { unique: false })
        }
        if (!db.objectStoreNames.contains(BLOBS_STORE)) {
          db.createObjectStore(BLOBS_STORE, { keyPath: ['mediaId', 'variant'] })
        }
      },
    })
  }
  return dbPromise
}

export async function persistMediaRecord(metadata, blobs) {
  const db = await getDb()
  if (!db) throw new Error('Media database is not available in this environment')
  const tx = db.transaction([META_STORE, BLOBS_STORE], 'readwrite')
  const metaStore = tx.objectStore(META_STORE)
  const blobStore = tx.objectStore(BLOBS_STORE)
  await metaStore.put(metadata)
  const entries = Object.entries(blobs ?? {})
  await Promise.all(
    entries.map(async ([variant, blob]) => {
      if (!blob) return
      await blobStore.put({ mediaId: metadata.id, variant, blob })
    }),
  )
  await tx.done
}

export async function removeMediaRecord(id, variants = []) {
  const db = await getDb()
  if (!db) return
  const tx = db.transaction([META_STORE, BLOBS_STORE], 'readwrite')
  await tx.objectStore(META_STORE).delete(id)
  const blobStore = tx.objectStore(BLOBS_STORE)
  const keys =
    variants.length > 0
      ? variants.map((variant) => [id, variant])
      : await blobStore.getAllKeys()
  await Promise.all(
    keys
      .filter((key) => Array.isArray(key) && key[0] === id)
      .map((key) => blobStore.delete(key).catch(() => {})),
  )
  await tx.done
}

export async function getMediaBlob(id, variant = 'preview') {
  const db = await getDb()
  if (!db) return null
  const record = await db.get(BLOBS_STORE, [id, variant])
  return record?.blob ?? null
}

export async function mediaRecordExists(id) {
  const db = await getDb()
  if (!db) return false
  return Boolean(await db.getKey(META_STORE, id))
}

export async function listAllMetadata() {
  const db = await getDb()
  if (!db) return []
  return db.getAll(META_STORE)
}
