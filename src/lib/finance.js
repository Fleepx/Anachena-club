import { requirementsFor, monthKey, isPast } from './inventory.js'

export function eventMoney(event, itemById, setupById, report) {
  const income = (event.pricePerGuest ?? 0) * event.guestCount

  let supplies = 0
  for (const { item, required } of requirementsFor(event, itemById, setupById)) {
    if (item.type === 'consumable') supplies += required * item.unitCost
  }

  const extra = event.eventCosts ?? 0

  const breakage = report
    ? report.lines.reduce((s, l) => s + (itemById[l.itemId]?.unitCost ?? 0) * l.qty, 0)
    : 0

  const expenses = supplies + extra + breakage
  const margin = income - expenses

  return {
    income,
    supplies,
    extra,
    breakage,
    expenses,
    margin,
    marginPct: income > 0 ? (margin / income) * 100 : 0
  }
}

export function monthlyCashflow(events, itemById, setupById, reportByEvent, today) {
  const meses = new Map()

  for (const event of events) {
    const key = monthKey(event.date)
    if (!meses.has(key)) {
      meses.set(key, {
        key,
        realizados: 0,
        confirmados: 0,
        tentativos: 0,
        income: 0,
        incomeTentative: 0,
        expenses: 0,
        margin: 0,
        supplies: 0,
        extra: 0,
        breakage: 0
      })
    }

    const m = meses.get(key)
    const pasado = isPast(event, today)
    const tentativo = !pasado && event.status === 'tentative'
    const plata = eventMoney(event, itemById, setupById, reportByEvent[event.id])

    if (pasado) m.realizados += 1
    else if (tentativo) m.tentativos += 1
    else m.confirmados += 1

    if (tentativo) {
      m.incomeTentative += plata.income
    } else {
      m.income += plata.income
      m.expenses += plata.expenses
      m.margin += plata.margin
      m.supplies += plata.supplies
      m.extra += plata.extra
      m.breakage += plata.breakage
    }
  }

  return [...meses.values()]
    .sort((a, b) => a.key.localeCompare(b.key))
    .map((m) => ({
      ...m,
      marginPct: m.income > 0 ? (m.margin / m.income) * 100 : 0,
      pasado: m.key < monthKey(today),
      actual: m.key === monthKey(today)
    }))
}

export function sumMonths(months) {
  return months.reduce(
    (acc, m) => ({
      income: acc.income + m.income,
      incomeTentative: acc.incomeTentative + m.incomeTentative,
      expenses: acc.expenses + m.expenses,
      margin: acc.margin + m.margin,
      supplies: acc.supplies + m.supplies,
      extra: acc.extra + m.extra,
      breakage: acc.breakage + m.breakage,
      eventos: acc.eventos + m.realizados + m.confirmados + m.tentativos
    }),
    {
      income: 0,
      incomeTentative: 0,
      expenses: 0,
      margin: 0,
      supplies: 0,
      extra: 0,
      breakage: 0,
      eventos: 0
    }
  )
}
