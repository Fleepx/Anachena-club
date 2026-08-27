export const TINTA = [51, 51, 51]
export const ACENTO = [39, 76, 123]
export const ROJO = [204, 0, 0]
export const FONDO = [249, 249, 249]

export const M = 15
export const AN = 185.9

export const money = (n) => '$' + Math.round(n).toLocaleString('es-CL')

export const dmy = (iso) => {
  const [y, m, d] = iso.split('-')
  return `${d}-${m}-${y}`
}

const LOGO_URL = '/brand/logo-pdf.png'

let loader = null
export async function loadJsPDF() {
  if (!loader) {
    loader = import('jspdf').catch((err) => {
      loader = null
      throw err
    })
  }
  const mod = await loader
  return mod.jsPDF
}

let logoCache
export function loadLogo() {
  if (!logoCache) {
    logoCache = (async () => {
      try {
        const res = await fetch(LOGO_URL)
        if (!res.ok) throw new Error(String(res.status))
        const blob = await res.blob()
        return await new Promise((ok, mal) => {
          const fr = new FileReader()
          fr.onload = () => ok(fr.result)
          fr.onerror = () => mal(fr.error)
          fr.readAsDataURL(blob)
        })
      } catch {
        return null
      }
    })()
  }
  return logoCache
}
