const round = (n) => Math.ceil(n - 0.000001)

export function totalYield(item) {
  const limpieza = item.yieldRate ?? 1
  const coccion = item.recipeBasis === 'raw' ? 1 : item.cookingYield ?? 1
  return limpieza * coccion
}

export function requirementsFor(event, itemById, setupById) {
  const acumulado = new Map()

  for (const id of [event.setupId, event.menuId, event.cocktailId]) {
    const plantilla = id ? setupById[id] : null
    if (!plantilla) continue

    for (const line of plantilla.lines) {
      const item = itemById[line.itemId]
      if (!item) continue

      const net = line.perGuest != null ? line.perGuest * event.guestCount : line.qty
      acumulado.set(item.id, (acumulado.get(item.id) ?? 0) + net)
    }
  }

  return [...acumulado].map(([itemId, crudo]) => {
    const item = itemById[itemId]
    const net = round(crudo)
    const rate = totalYield(item)
    return { item, net, rate, required: rate < 1 ? round(net / rate) : net }
  })
}

export function shortagesByEvent(eventList, itemById, setupById) {
  const sorted = [...eventList].sort((a, b) => a.date.localeCompare(b.date))
  const remaining = {}

  return sorted.map((event) => {
    const lines = []

    for (const { item, required } of requirementsFor(event, itemById, setupById)) {
      const isConsumable = item.type === 'consumable'
      const available = isConsumable
        ? remaining[item.id] ?? item.stockOnHand
        : item.stockOnHand

      const balance = available - required
      if (isConsumable) {
        remaining[item.id] = Math.max(balance, 0)
      }

      if (balance < 0) {
        lines.push({
          item,
          required,
          available: Math.max(available, 0),
          missing: balance,
          cost: Math.abs(balance) * item.unitCost
        })
      }
    }

    lines.sort((a, b) => a.missing - b.missing)

    return {
      event,
      lines,
      purchaseCost: lines.reduce((sum, l) => sum + l.cost, 0)
    }
  })
}

export function belowMinimum(items) {
  return items.filter(
    (i) => i.type === 'consumable' && i.stockOnHand < (i.minStock ?? 0)
  )
}

export const clp = (n) => '$' + Math.round(n).toLocaleString('es-CL')

export const formatDate = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('es-CL', {
    weekday: 'short',
    day: 'numeric',
    month: 'long'
  })
}

export const daysUntil = (iso, today = new Date()) => {
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((target - base) / 86400000)
}

export const monthKey = (iso) => iso.slice(0, 7)

export const monthLabel = (key) => {
  const [y, m] = key.split('-').map(Number)
  const label = new Date(y, m - 1, 1).toLocaleDateString('es-CL', {
    month: 'long',
    year: 'numeric'
  })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function monthGrid(key) {
  const [y, m] = key.split('-').map(Number)
  const daysInMonth = new Date(y, m, 0).getDate()
  const firstWeekday = (new Date(y, m - 1, 1).getDay() + 6) % 7

  const cells = Array.from({ length: firstWeekday }, () => null)
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({
      day: d,
      iso: `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    })
  }
  while (cells.length % 7 !== 0) cells.push(null)

  return cells
}

export const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export const nextMonth = (key) => {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m, 1)
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
}

export const realToday = () => {
  const d = new Date()
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  )
}

export const isPast = (event, today) => event.date < today
