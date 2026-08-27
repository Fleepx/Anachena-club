import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { items as seedItems } from '../data/items.js'
import { breakageReports as seedReports } from '../data/breakage.js'
import { events as seedEvents } from '../data/events.js'
import { setups, menus, cocktails } from '../data/setups.js'

const seedSetups = [...setups, ...menus, ...cocktails]
import { realToday } from '../lib/inventory.js'
import { WAREHOUSE_BY_CATEGORY } from '../data/warehouses.js'
import { SYNCED, cloudEnabled, pushChanges, seed, watchAll } from '../lib/cloud.js'

const STORAGE_KEY = 'cac-inventory-v2'
const InventoryContext = createContext(null)

function aplicarBajas(items, lines) {
  const byId = Object.fromEntries(lines.map((l) => [l.itemId, l]))

  return items.map((item) => {
    const line = byId[item.id]
    if (!line) return item
    return {
      ...item,
      stockOnHand: Math.max(item.stockOnHand - line.qty, 0),
      stockBroken:
        line.reason === 'broken' ? (item.stockBroken ?? 0) + line.qty : item.stockBroken ?? 0
    }
  })
}

function reducer(state, action) {
  const now = state.simulatedDate ?? realToday()

  switch (action.type) {
    case 'hydrate':
      return { ...state, [action.payload.name]: action.payload.rows }

    case 'closeEvent': {
      const { eventId, lines, note, closedBy } = action.payload
      const clean = lines.filter((l) => l.qty > 0)

      const esAdmin = (state.role ?? 'admin') === 'admin'

      const parte = {
        id: 'br-' + eventId + '-' + Date.now(),
        eventId,
        closedAt: now,
        closedBy: closedBy || 'Sin firmar',
        lines: clean,
        note: note || '',
        status: esAdmin ? 'confirmed' : 'draft'
      }

      return {
        ...state,
        items: esAdmin ? aplicarBajas(state.items, clean) : state.items,
        reports: [...state.reports, parte]
      }
    }

    case 'confirmReport': {
      const parte = state.reports.find((r) => r.id === action.payload.id)
      if (!parte || parte.status === 'confirmed') return state

      return {
        ...state,
        items: aplicarBajas(state.items, parte.lines),
        reports: state.reports.map((r) =>
          r.id === parte.id
            ? { ...r, status: 'confirmed', confirmedAt: now, confirmedBy: action.payload.by || '' }
            : r
        )
      }
    }

    case 'discardReport': {
      const parte = state.reports.find((r) => r.id === action.payload)
      if (!parte || parte.status === 'confirmed') return state
      return { ...state, reports: state.reports.filter((r) => r.id !== parte.id) }
    }

    case 'addStock': {
      const { itemId, qty, unitCost, note } = action.payload
      if (!(qty > 0)) return state

      return {
        ...state,
        items: state.items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                stockOnHand: item.stockOnHand + qty,
                unitCost: unitCost > 0 ? unitCost : item.unitCost
              }
            : item
        ),
        purchases: [
          ...state.purchases,
          {
            id: 'pu-' + Date.now(),
            itemId,
            qty,
            unitCost: unitCost > 0 ? unitCost : null,
            at: now,
            note: note || ''
          }
        ]
      }
    }

    case 'createItem': {
      const { name, type, category, unit, qty, unitCost, minStock, warehouse, detail } = action.payload
      const clean = String(name || '').trim()
      if (!clean) return state

      const base = clean
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      let id = base || 'item'
      let n = 2
      while (state.items.some((i) => i.id === id)) id = base + '-' + n++

      const item = {
        id,
        name: clean,
        type,
        category,
        unit: unit || 'unidad',
        stockOnHand: qty > 0 ? qty : 0,
        stockOut: 0,
        stockBroken: 0,
        unitCost: unitCost > 0 ? unitCost : 0,
        warehouse: warehouse || WAREHOUSE_BY_CATEGORY[category],
        detail: detail || '',
        ...(type === 'consumable' ? { minStock: minStock > 0 ? minStock : 0 } : {})
      }

      return {
        ...state,
        items: [...state.items, item],
        purchases:
          qty > 0
            ? [
                ...state.purchases,
                {
                  id: 'pu-' + Date.now(),
                  itemId: id,
                  qty,
                  unitCost: unitCost > 0 ? unitCost : null,
                  at: now,
                  note: 'Alta de item'
                }
              ]
            : state.purchases
      }
    }

    case 'createEvent': {
      const e = action.payload
      const clean = String(e.clientName || '').trim()
      if (!clean || !e.date) return state

      let setups = state.setups
      let setupId = e.setupId

      const nombreNuevo = String(e.newTypeName || '').trim()
      if (nombreNuevo) {
        const base = state.setups.find((s) => s.id === e.basedOn) ?? state.setups[0]
        setupId = 'setup-' + Date.now()
        setups = [
          ...setups,
          { id: setupId, name: nombreNuevo, kind: 'setup', lines: base.lines, custom: true }
        ]
      }

      return {
        ...state,
        setups,
        events: [
          ...state.events,
          {
            id: 'ev-' + Date.now(),
            clientName: clean,
            setupId,
            menuId: e.menuId || null,
            cocktailId: e.cocktailId || null,
            date: e.date,
            startTime: e.startTime || '20:00',
            guestCount: Math.max(1, Math.floor(Number(e.guestCount) || 0)),
            contactName: String(e.contactName || '').trim(),
            contactPhone: String(e.contactPhone || '').trim(),
            contactEmail: String(e.contactEmail || '').trim(),
            pricePerGuest: Math.max(0, Math.round(Number(e.pricePerGuest) || 0)),
            eventCosts: Math.max(0, Math.round(Number(e.eventCosts) || 0)),
            notes: String(e.notes || '').trim(),
            status: e.status === 'tentative' ? 'tentative' : 'confirmed'
          }
        ]
      }
    }

    case 'eventPatch':
      return {
        ...state,
        events: state.events.map((e) =>
          e.id === action.payload.id ? { ...e, ...action.payload.patch } : e
        )
      }

    case 'importItems': {
      const { nuevos, actualizados, type } = action.payload

      const parches = new Map(actualizados.map((a) => [a.id, a.datos]))
      let items = state.items.map((i) => (parches.has(i.id) ? { ...i, ...parches.get(i.id) } : i))

      const usados = new Set(items.map((i) => i.id))
      const creados = nuevos.map((datos, n) => {
        const base =
          datos.name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') || 'item'

        let id = base
        let k = 2
        while (usados.has(id)) id = base + '-' + k++
        usados.add(id)

        return {
          id,
          type,
          stockOut: 0,
          stockBroken: 0,
          ...datos
        }
      })

      return { ...state, items: [...items, ...creados] }
    }

    case 'itemPatch':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.payload.id ? { ...i, ...action.payload.patch } : i
        )
      }

    case 'setupPatch':
      return {
        ...state,
        setups: state.setups.map((s) =>
          s.id === action.payload.id ? { ...s, ...action.payload.patch } : s
        )
      }

    case 'setupLine': {
      const { setupId, itemId, patch } = action.payload
      return {
        ...state,
        setups: state.setups.map((s) => {
          if (s.id !== setupId) return s
          const existe = s.lines.some((l) => l.itemId === itemId)

          if (patch === null) return { ...s, lines: s.lines.filter((l) => l.itemId !== itemId) }

          const lines = existe
            ? s.lines.map((l) => (l.itemId === itemId ? { itemId, ...patch } : l))
            : [...s.lines, { itemId, ...patch }]

          return { ...s, lines }
        })
      }
    }

    case 'createSetup': {
      const name = String(action.payload.name || '').trim()
      if (!name) return state
      const base = state.setups.find((s) => s.id === action.payload.basedOn)
      return {
        ...state,
        setups: [
          ...state.setups,
          {
            id: 'setup-' + Date.now(),
            name,
            kind: action.payload.kind ?? base?.kind ?? 'setup',
            lines: base ? base.lines : [],
            custom: true
          }
        ]
      }
    }

    case 'deleteSetup': {
      const id = action.payload
      const enUso = state.events.some(
        (e) => e.setupId === id || e.menuId === id || e.cocktailId === id
      )
      if (enUso) return state
      return { ...state, setups: state.setups.filter((s) => s.id !== id) }
    }

    case 'dropDemoEvents': {
      const demoIds = new Set(state.events.filter((e) => e.demo).map((e) => e.id))
      return {
        ...state,
        events: state.events.filter((e) => !e.demo),
        reports: state.reports.filter((r) => !demoIds.has(r.eventId))
      }
    }

    case 'setRole':
      return { ...state, role: action.payload === 'staff' ? 'staff' : 'admin' }

    case 'setDate':
      return { ...state, simulatedDate: action.payload || null }

    case 'reset':
      return initialState()

    default:
      return state
  }
}

function initialState() {
  return {
    items: seedItems,
    events: seedEvents,
    setups: seedSetups,
    reports: seedReports,
    purchases: [],
    simulatedDate: null,
    role: 'admin'
  }
}

function mergePorId(semilla, guardado) {
  if (!Array.isArray(guardado) || guardado.length === 0) return semilla

  const porId = new Map(semilla.map((x) => [x.id, x]))
  for (const x of guardado) {
    porId.set(x.id, { ...porId.get(x.id), ...x })
  }
  return [...porId.values()]
}

function load() {
  const base = initialState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base

    const saved = JSON.parse(raw)
    if (!saved?.items?.length) return base

    return {
      ...base,
      ...saved,
      items: mergePorId(base.items, saved.items),
      setups: mergePorId(base.setups, saved.setups),
      events: mergePorId(base.events, saved.events)
    }
  } catch {
    return base
  }
}

export function InventoryProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)
  const [cloudError, setCloudError] = useState(null)
  const remote = useRef(null)
  const ready = useRef(!cloudEnabled)
  const latest = useRef(state)
  latest.current = state

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
    }
  }, [state])

  useEffect(() => {
    if (!cloudEnabled) return

    const llegadas = new Set()
    let sembrando = false
    let vivo = true
    let detener = null

    watchAll(
      (name, rows) => {
        const primera = !llegadas.has(name)
        llegadas.add(name)
        remote.current = { ...(remote.current ?? {}), [name]: rows }

        if (primera && rows.length === 0 && (latest.current[name] ?? []).length > 0) {
          if (name === 'items' && !sembrando) {
            sembrando = true
            seed(latest.current).catch(() => setCloudError('No se pudo cargar el catálogo inicial.'))
          }
          if (llegadas.size === SYNCED.length) ready.current = true
          return
        }

        dispatch({ type: 'hydrate', payload: { name, rows } })
        if (llegadas.size === SYNCED.length) ready.current = true
      },
      () => setCloudError('Sin conexión con el servidor. Los cambios quedan en este dispositivo.')
    )
      .then((stop) => {
        if (vivo) detener = stop
        else stop()
      })
      .catch(() => setCloudError('No se pudo conectar con el servidor.'))

    return () => {
      vivo = false
      if (detener) detener()
    }
  }, [])

  useEffect(() => {
    if (!cloudEnabled || !ready.current) return

    pushChanges(remote.current, state)
      .then((escritos) => {
        if (escritos > 0) setCloudError(null)
        remote.current = Object.fromEntries(SYNCED.map((n) => [n, state[n] ?? []]))
      })
      .catch(() => setCloudError('No se pudo guardar en el servidor. Revisá la conexión.'))
  }, [state])

  const value = useMemo(() => {
    const itemById = Object.fromEntries(state.items.map((i) => [i.id, i]))
    const setupById = Object.fromEntries(state.setups.map((s) => [s.id, s]))
    const reportByEvent = Object.fromEntries(state.reports.map((r) => [r.eventId, r]))
    return {
      cloudEnabled,
      cloudError,
      today: state.simulatedDate ?? realToday(),
      role: state.role ?? 'admin',
      canEdit: (state.role ?? 'admin') === 'admin',
      simulatedDate: state.simulatedDate,
      items: state.items,
      itemById,
      events: state.events,
      setups: state.setups,
      setupById,
      reports: state.reports,
      reportByEvent,
      purchases: state.purchases,
      closeEvent: (payload) => dispatch({ type: 'closeEvent', payload }),
      confirmReport: (id, by) => dispatch({ type: 'confirmReport', payload: { id, by } }),
      discardReport: (id) => dispatch({ type: 'discardReport', payload: id }),
      addStock: (payload) => dispatch({ type: 'addStock', payload }),
      createItem: (payload) => dispatch({ type: 'createItem', payload }),
      createEvent: (payload) => dispatch({ type: 'createEvent', payload }),
      dropDemoEvents: () => dispatch({ type: 'dropDemoEvents' }),
      eventPatch: (id, patch) => dispatch({ type: 'eventPatch', payload: { id, patch } }),
      itemPatch: (id, patch) => dispatch({ type: 'itemPatch', payload: { id, patch } }),
      importItems: (payload) => dispatch({ type: 'importItems', payload }),
      setupPatch: (id, patch) => dispatch({ type: 'setupPatch', payload: { id, patch } }),
      setupLine: (setupId, itemId, patch) =>
        dispatch({ type: 'setupLine', payload: { setupId, itemId, patch } }),
      createSetup: (payload) => dispatch({ type: 'createSetup', payload }),
      deleteSetup: (id) => dispatch({ type: 'deleteSetup', payload: id }),
      setDate: (iso) => dispatch({ type: 'setDate', payload: iso }),
      setRole: (r) => dispatch({ type: 'setRole', payload: r }),
      reset: () => dispatch({ type: 'reset' })
    }
  }, [state, cloudError])

  return <InventoryContext.Provider value={value}>{children}</InventoryContext.Provider>
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory fuera de InventoryProvider')
  return ctx
}
