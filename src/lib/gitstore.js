const CFG_KEY = 'cac_git_cfg'

export const SYNCED = ['items', 'setups', 'events', 'reports', 'purchases']

const pathOf = (name) => 'data/' + name + '.json'

export function readConfig() {
  try {
    const raw = localStorage.getItem(CFG_KEY)
    if (!raw) return null
    const cfg = JSON.parse(raw)
    return cfg?.owner && cfg?.repo && cfg?.token ? cfg : null
  } catch {
    return null
  }
}

export function saveConfig(cfg) {
  localStorage.setItem(CFG_KEY, JSON.stringify(cfg))
}

export function clearConfig() {
  localStorage.removeItem(CFG_KEY)
}

function encode(text) {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  }
  return btoa(binary)
}

function decode(base64) {
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

async function api(cfg, path, opts = {}) {
  const base = 'https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo
  const url = path ? base + '/' + path : base

  let res
  try {
    res = await fetch(url, {
      ...opts,
      headers: {
        Authorization: 'Bearer ' + cfg.token,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(opts.headers ?? {})
      }
    })
  } catch {
    throw new Error('No se pudo contactar a GitHub. Revisá la conexión a internet.')
  }

  if (res.status === 404) return null
  if (!res.ok) {
    const detalle = await res.text()
    const error = new Error(mensaje(res.status, detalle))
    error.status = res.status
    throw error
  }
  return res.json()
}

function mensaje(status, detalle) {
  if (status === 401) return 'El token no es válido o venció.'
  if (status === 403 && /rate limit/i.test(detalle)) return 'GitHub cortó por exceso de consultas. Esperá un minuto.'
  if (status === 403) return 'El token no tiene permiso de escritura sobre este repositorio.'
  if (status === 409 && /empty/i.test(detalle)) return 'El repositorio de datos todavía está vacío.'
  if (status === 409 || /sha/i.test(detalle)) return 'Otro dispositivo guardó primero.'
  return 'GitHub respondió ' + status + '.'
}

export async function checkAccess(cfg) {
  const repo = await api(cfg, '')
  if (!repo) {
    throw new Error(
      'No se llegó al repositorio. Si el nombre está bien, el token no lo tiene incluido: ' +
        'revisá que esté seleccionado en la lista del token.'
    )
  }
  if (!repo.permissions?.push) throw new Error('El token puede leer pero no escribir en este repositorio.')
  return true
}

export async function headSha(cfg) {
  try {
    const commits = await api(cfg, 'commits?per_page=1')
    return commits?.[0]?.sha ?? null
  } catch (e) {
    if (e.status === 409) return null
    throw e
  }
}

export async function readAll(cfg) {
  const slices = {}
  const shas = {}

  await Promise.all(
    SYNCED.map(async (name) => {
      const file = await api(cfg, 'contents/' + pathOf(name) + '?t=' + Date.now())
      if (!file) return
      shas[name] = file.sha
      try {
        slices[name] = JSON.parse(decode(file.content))
      } catch {
        slices[name] = []
      }
    })
  )

  return { slices, shas }
}

export async function writeChanged(cfg, prev, next, shas, note) {
  const escritos = []

  for (const name of SYNCED) {
    if (!next?.[name]) continue

    const rows = next[name]
    if (JSON.stringify(prev?.[name] ?? null) === JSON.stringify(rows)) continue

    const body = {
      message: note ?? 'Actualizar ' + name,
      content: encode(JSON.stringify(rows, null, 2))
    }
    if (shas[name]) body.sha = shas[name]

    const res = await api(cfg, 'contents/' + pathOf(name), {
      method: 'PUT',
      body: JSON.stringify(body)
    })

    shas[name] = res.content.sha
    escritos.push(name)
  }

  return escritos
}

export async function readMeta(cfg) {
  const file = await api(cfg, 'contents/data/meta.json?t=' + Date.now())
  if (!file) return null
  try {
    return JSON.parse(decode(file.content))
  } catch {
    return null
  }
}

export async function writeMeta(cfg, meta, shas) {
  const body = {
    message: 'Actualizar catálogo',
    content: encode(JSON.stringify(meta, null, 2))
  }
  if (shas.meta) body.sha = shas.meta

  const res = await api(cfg, 'contents/data/meta.json', {
    method: 'PUT',
    body: JSON.stringify(body)
  })
  shas.meta = res.content.sha
}

export async function metaSha(cfg) {
  const file = await api(cfg, 'contents/data/meta.json')
  return file?.sha
}
