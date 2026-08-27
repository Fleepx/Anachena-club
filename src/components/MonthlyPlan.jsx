import { useMemo, useState } from 'react'
import { useInventory } from '../store/store.jsx'
import EventForm from './EventForm.jsx'
import { monthlyPlan, monthOptions } from '../lib/monthly.js'
import { clp, monthKey, monthLabel, formatDate, nextMonth, isPast } from '../lib/inventory.js'
import MonthCalendar from './MonthCalendar.jsx'

const pendingOf = (events, key, today) =>
  events
    .filter((e) => monthKey(e.date) === key && !isPast(e, today))
    .sort((a, b) => a.date.localeCompare(b.date))

const defaultSelection = (events, key, today) =>
  new Set(pendingOf(events, key, today).map((e) => e.id))

export default function MonthlyPlan() {
  const { itemById, setupById, today, events, canEdit } = useInventory()
  const [adding, setAdding] = useState(false)
  const months = useMemo(() => monthOptions(events), [events])
  const [month, setMonth] = useState(() => monthKey(today))
  const [included, setIncluded] = useState(() => defaultSelection(events, monthKey(today), today))

  const next = nextMonth(month)

  const inMonth = useMemo(
    () =>
      events
        .filter((e) => monthKey(e.date) === month)
        .sort((a, b) => a.date.localeCompare(b.date)),
    [events, month]
  )

  const monthPending = inMonth.filter((e) => !isPast(e, today))
  const nextPending = useMemo(() => pendingOf(events, next, today), [events, next, today])

  const chosen = [...monthPending, ...nextPending].filter((e) => included.has(e.id))
  const chosenNext = nextPending.filter((e) => included.has(e.id))
  const plan = monthlyPlan(chosen, itemById, setupById)

  const toggle = (id) =>
    setIncluded((prev) => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })

  const changeMonth = (key) => {
    setMonth(key)
    setIncluded(defaultSelection(events, key, today))
  }

  const isDefault =
    included.size === monthPending.length && monthPending.every((e) => included.has(e.id))

  const nothingToPlan = monthPending.length === 0 && nextPending.length === 0

  return (
    <>
      <section className="page-head">
        <div className="section-head">
          <h2>Evaluación mensual</h2>
        </div>
        <div className="page-actions">
          {canEdit && !adding && (
            <button className="btn btn-primary" onClick={() => setAdding(true)}>
              Nuevo evento
            </button>
          )}
          <label className="month-select">
            <span>Mes</span>
            <select value={month} onChange={(e) => changeMonth(e.target.value)}>
              {months.map((m) => (
                <option key={m.key} value={m.key}>
                  {monthLabel(m.key)}
                  {m.count ? ` (${m.count})` : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {adding && (
        <div className="add-panel">
          <EventForm onDone={() => setAdding(false)} />
        </div>
      )}

      <MonthCalendar
        month={month}
        events={inMonth}
        included={included}
        onToggle={toggle}
        today={today}
      />

      {nothingToPlan ? (
        <p className="empty">
          {inMonth.length === 0
            ? 'No hay eventos agendados en ' + monthLabel(month) + '.'
            : 'Los ' + inMonth.length + ' eventos de ' + monthLabel(month) +
              ' ya se realizaron. No queda nada por comprar.'}
        </p>
      ) : (
        <>
          <section className="stats">
            <div className="stat">
              <strong className="stat-value">
                {chosen.length}
                {chosenNext.length > 0 && (
                  <span className="stat-of"> +{chosenNext.length} del mes que viene</span>
                )}
              </strong>
              <span className="stat-label">Eventos en el cálculo</span>
            </div>
            <div className="stat">
              <strong className="stat-value">{plan.guestTotal}</strong>
              <span className="stat-label">Personas</span>
            </div>
            <div className={'stat' + (plan.purchase.length ? ' stat-warn' : ' stat-ok')}>
              <strong className="stat-value">{plan.purchase.length}</strong>
              <span className="stat-label">Items a comprar</span>
            </div>
            <div className={'stat' + (plan.purchaseTotal ? ' stat-warn' : ' stat-ok')}>
              <strong className="stat-value stat-value-sm">{clp(plan.purchaseTotal)}</strong>
              <span className="stat-label">Total del cálculo</span>
            </div>
          </section>

          <section className="section">
            <div className="section-head section-head-row">
              <h2>Eventos considerados</h2>
              {!isDefault && (
                <button className="link-btn" onClick={() => setIncluded(defaultSelection(events, month, today))}>
                  Volver a {monthLabel(month).split(' ')[0].toLowerCase()}
                </button>
              )}
            </div>

            {monthPending.length > 0 && (
              <EventChecklist events={monthPending} included={included} onToggle={toggle} />
            )}

            {nextPending.length > 0 && (
              <>
                <div className="next-head">
                  <h3>Del mes siguiente — {monthLabel(next)}</h3>
                </div>
                <EventChecklist
                  events={nextPending}
                  included={included}
                  onToggle={toggle}
                  muted
                />
              </>
            )}
          </section>

          <section className="section">
            <div className="section-head">
              <h2>Compras pendientes</h2>
            </div>

            {chosen.length === 0 ? (
              <p className="empty">No hay ningún evento marcado. No hay nada que calcular.</p>
            ) : plan.purchase.length === 0 ? (
              <p className="all-good">Hay stock para todo. No hay que comprar nada.</p>
            ) : (
              <>
                <PurchaseTable
                  title="Menaje e inmueble"
                  rows={plan.purchaseAssets}
                  empty="Nada que comprar de menaje."
                />
                <PurchaseTable
                  title="Insumos de comida"
                  rows={plan.purchaseConsumables}
                  empty="Nada que comprar de comida."
                />
                <div className="purchase-total">
                  <span>
                    Total a comprar
                    <span className="pt-scope">
                      {chosenNext.length > 0
                        ? ` · ${monthLabel(month)} + ${chosenNext.length} de ${monthLabel(next)}`
                        : ` · ${monthLabel(month)}`}
                    </span>
                  </span>
                  <strong>{clp(plan.purchaseTotal)}</strong>
                </div>
              </>
            )}
          </section>

          {chosen.length > 0 && (
            <section className="section">
              <div className="section-head">
                <h2>Balance de activos</h2>
              </div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th
                        className="num th-help"
                        title="Lo máximo que se necesita en un solo evento del mes. No es la suma: el menaje vuelve a bodega entre un evento y otro."
                      >
                        Máx
                      </th>
                      <th className="num">En bodega</th>
                      <th className="num">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.assets.map((r) => (
                      <tr key={r.item.id} className={r.balance < 0 ? 'row-low' : undefined}>
                        <td>
                          <span className="cell-name">{r.item.name}</span>
                          <span className="cell-sub">
                            {r.peakEvent ? r.peakEvent.clientName : '—'} · en {r.usedIn}{' '}
                            {r.usedIn === 1 ? 'evento' : 'eventos'}
                          </span>
                        </td>
                        <td className="num">{r.requirement}</td>
                        <td className="num">{r.stock}</td>
                        <td className="num">
                          <span className={r.balance < 0 ? 'saldo saldo-neg' : 'saldo saldo-pos'}>
                            {r.balance > 0 ? '+' + r.balance : r.balance}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </>
      )}
    </>
  )
}

function EventChecklist({ events, included, onToggle, muted }) {
  return (
    <ul className={muted ? 'month-events month-events-next' : 'month-events'}>
      {events.map((e) => {
        const on = included.has(e.id)
        return (
          <li key={e.id} className={on ? undefined : 'me-off'}>
            <label>
              <input type="checkbox" checked={on} onChange={() => onToggle(e.id)} />
              <span className="me-date">{formatDate(e.date)}</span>
              <span className="me-name">
                {e.clientName}
                {e.demo && <span className="tag-demo">prueba</span>}
              </span>
              <span className="me-guests">{e.guestCount} personas</span>
            </label>
          </li>
        )
      })}
    </ul>
  )
}

function PurchaseTable({ title, rows, empty }) {
  return (
    <div className="purchase-block">
      <h3 className="block-title">{title}</h3>
      {rows.length === 0 ? (
        <p className="block-empty">{empty}</p>
      ) : (
        <div className="table-wrap">
          <table className="table table-compact">
            <thead>
              <tr>
                <th>Item</th>
                <th className="num">Necesita</th>
                <th className="num">Hay</th>
                <th className="num">Comprar</th>
                <th className="num hide-sm">Costo</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.item.id}>
                  <td>
                    <span className="cell-name">{r.item.name}</span>{' '}
                    <span className="cell-unit">{r.item.unit}</span>
                  </td>
                  <td className="num muted">{r.requirement}</td>
                  <td className="num muted">{r.stock}</td>
                  <td className="num">
                    <span className="buy">{r.buy}</span>
                  </td>
                  <td className="num hide-sm">{clp(r.cost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
