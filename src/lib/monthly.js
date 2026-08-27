import { requirementsFor, monthKey } from './inventory.js'

export function monthlyPlan(monthEvents, itemById, setupById) {
  const acc = {}

  for (const event of monthEvents) {
    for (const { item, required } of requirementsFor(event, itemById, setupById)) {
      const entry = (acc[item.id] ??= {
        item,
        requirement: 0,
        peakEvent: null,
        usedIn: 0
      })
      entry.usedIn += 1

      if (item.type === 'asset') {
        if (required > entry.requirement) {
          entry.requirement = required
          entry.peakEvent = event
        }
      } else {
        entry.requirement += required
      }
    }
  }

  const rows = Object.values(acc).map((entry) => {
    const stock = entry.item.stockOnHand
    const balance = stock - entry.requirement
    return {
      ...entry,
      stock,
      balance,
      buy: balance < 0 ? Math.abs(balance) : 0,
      cost: balance < 0 ? Math.abs(balance) * entry.item.unitCost : 0
    }
  })

  const byNeed = (a, b) => a.balance - b.balance

  const assets = rows.filter((r) => r.item.type === 'asset').sort(byNeed)
  const consumables = rows.filter((r) => r.item.type === 'consumable').sort(byNeed)
  const purchase = rows.filter((r) => r.buy > 0).sort((a, b) => b.cost - a.cost)

  return {
    events: monthEvents,
    guestTotal: monthEvents.reduce((s, e) => s + e.guestCount, 0),
    assets,
    consumables,
    purchase,
    purchaseTotal: purchase.reduce((s, r) => s + r.cost, 0),
    purchaseAssets: purchase.filter((r) => r.item.type === 'asset'),
    purchaseConsumables: purchase.filter((r) => r.item.type === 'consumable'),
    surplus: rows.filter((r) => r.balance > 0).sort((a, b) => b.balance - a.balance)
  }
}

export function monthOptions(eventList) {
  const counts = {}
  for (const e of eventList) {
    const k = monthKey(e.date)
    counts[k] = (counts[k] ?? 0) + 1
  }

  const years = [...new Set(eventList.map((e) => e.date.slice(0, 4)))].sort()

  return years.flatMap((year) =>
    Array.from({ length: 12 }, (_, i) => {
      const key = year + '-' + String(i + 1).padStart(2, '0')
      return { key, year, count: counts[key] ?? 0 }
    })
  )
}

export function reportCost(report, itemById) {
  return report.lines.reduce((sum, l) => {
    const item = itemById[l.itemId]
    return sum + (item ? item.unitCost * l.qty : 0)
  }, 0)
}
