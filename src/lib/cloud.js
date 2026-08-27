const env = import.meta.env

const config = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
}

export const cloudEnabled = Boolean(config.apiKey && config.projectId)

export const SYNCED = ['items', 'events', 'setups', 'reports', 'purchases']

let sdk = null

async function firestore() {
  if (!sdk) {
    const [{ initializeApp }, fs] = await Promise.all([
      import('firebase/app'),
      import('firebase/firestore')
    ])
    sdk = { db: fs.getFirestore(initializeApp(config)), fs }
  }
  return sdk
}

const byId = (rows) => Object.fromEntries((rows ?? []).map((r) => [r.id, r]))

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b)

export async function watchAll(onSlice, onError) {
  const { db, fs } = await firestore()

  const stops = SYNCED.map((name) =>
    fs.onSnapshot(
      fs.collection(db, name),
      (snap) => onSlice(name, snap.docs.map((d) => d.data())),
      onError
    )
  )

  return () => stops.forEach((stop) => stop())
}

export async function pushChanges(prev, next) {
  const { db, fs } = await firestore()
  const batch = fs.writeBatch(db)
  let pending = 0

  for (const name of SYNCED) {
    const before = byId(prev?.[name])
    const after = byId(next?.[name])

    for (const [id, row] of Object.entries(after)) {
      if (!same(before[id], row)) {
        batch.set(fs.doc(db, name, id), row)
        pending += 1
      }
    }

    for (const id of Object.keys(before)) {
      if (!after[id]) {
        batch.delete(fs.doc(db, name, id))
        pending += 1
      }
    }
  }

  if (pending === 0) return 0
  await batch.commit()
  return pending
}

export async function seed(state) {
  return pushChanges(null, state)
}
