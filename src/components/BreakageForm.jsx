import { useState } from 'react'
import { useInventory } from '../store/store.jsx'
import { requirementsFor, clp, formatDate } from '../lib/inventory.js'

export default function BreakageForm({ event, onDone }) {
  const { itemById, setupById, closeEvent } = useInventory()
  const [counts, setCounts] = useState({})
  const [note, setNote] = useState('')
  const [closedBy, setClosedBy] = useState('')
  const [onlyTouched, setOnlyTouched] = useState(false)
  const [capped, setCapped] = useState({})

  const assets = requirementsFor(event, itemById, setupById).filter((r) => r.item.type === 'asset')

  const capOf = (item, required) => Math.min(required, item.stockOnHand)

  const roomFor = (item, required, field) => {
    const other = field === 'broken' ? 'missing' : 'broken'
    return Math.max(0, capOf(item, required) - (counts[item.id]?.[other] ?? 0))
  }

  const set = (item, required, field, raw) => {
    const room = roomFor(item, required, field)
    const parsed = Math.floor(Number(raw))
    const qty = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), room) : 0

    setCounts((c) => ({ ...c, [item.id]: { ...c[item.id], [field]: qty } }))
    setCapped((c) => ({
      ...c,
      [item.id + ':' + field]: Number.isFinite(parsed) && parsed > room ? room : null
    }))
  }

  const lines = []
  let cost = 0
  for (const { item } of assets) {
    const c = counts[item.id] ?? {}
    for (const reason of ['broken', 'missing']) {
      const qty = c[reason] ?? 0
      if (qty > 0) {
        lines.push({ itemId: item.id, qty, reason })
        cost += qty * item.unitCost
      }
    }
  }

  const visible = onlyTouched
    ? assets.filter(({ item }) => {
        const c = counts[item.id] ?? {}
        return (c.broken ?? 0) > 0 || (c.missing ?? 0) > 0
      })
    : assets

  const overflow = assets.filter(({ item, required }) => {
    const c = counts[item.id] ?? {}
    return (c.broken ?? 0) + (c.missing ?? 0) > capOf(item, required)
  })

  const submit = () => {
    if (overflow.length > 0) return
    closeEvent({ eventId: event.id, lines, note, closedBy })
    onDone?.()
  }

  return (
    <div className="form-panel">
      <div className="form-head">
        <div>
          <h3>Parte de roturas</h3>
          <p>
            {event.clientName} · {formatDate(event.date)} · {event.guestCount} personas
          </p>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={onlyTouched}
            onChange={(e) => setOnlyTouched(e.target.checked)}
          />
          Solo lo cargado
        </label>
      </div>

      <div className="table-wrap">
        <table className="table table-form">
          <thead>
            <tr>
              <th>Item</th>
              <th className="num">Salió</th>
              <th className="num">Rotas</th>
              <th className="num">No volvió</th>
            </tr>
          </thead>
          <tbody>
            {visible.map(({ item, required }) => {
              const c = counts[item.id] ?? {}
              const touched = (c.broken ?? 0) > 0 || (c.missing ?? 0) > 0
              const cap = capOf(item, required)
              const short = cap < required

              return (
                <tr key={item.id} className={touched ? 'row-touched' : undefined}>
                  <td>
                    <span className="cell-name">{item.name}</span>
                    <span className="cell-sub">
                      {clp(item.unitCost)} c/u
                      {short && ' · en bodega hay ' + item.stockOnHand}
                    </span>
                  </td>
                  <td className="num muted">{cap}</td>
                  <td className="num">
                    <QtyInput
                      value={c.broken}
                      max={roomFor(item, required, 'broken')}
                      capped={capped[item.id + ':broken']}
                      onChange={(v) => set(item, required, 'broken', v)}
                    />
                  </td>
                  <td className="num">
                    <QtyInput
                      value={c.missing}
                      max={roomFor(item, required, 'missing')}
                      capped={capped[item.id + ':missing']}
                      onChange={(v) => set(item, required, 'missing', v)}
                    />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="empty">
            {onlyTouched ? 'Todavía no cargaste nada.' : 'Este evento no lleva menaje.'}
          </p>
        )}
      </div>

      <div className="form-fields">
        <label>
          <span>Quién cierra</span>
          <input
            type="text"
            value={closedBy}
            placeholder="Nombre de quien contó"
            onChange={(e) => setClosedBy(e.target.value)}
          />
        </label>
        <label>
          <span>Observaciones</span>
          <input
            type="text"
            value={note}
            placeholder="Qué pasó"
            onChange={(e) => setNote(e.target.value)}
          />
        </label>
      </div>

      <div className="form-foot">
        <div className="form-total">
          {lines.length === 0 ? (
            <span>Volvió todo</span>
          ) : (
            <>
              <span>{lines.length} {lines.length === 1 ? 'línea' : 'líneas'}</span>
              <strong className={cost ? 'cost-danger' : undefined}>{clp(cost)}</strong>
            </>
          )}
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => onDone?.()}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={overflow.length > 0}
            onClick={submit}
          >
            {lines.length === 0 ? 'Cerrar sin roturas' : 'Cerrar evento y descontar'}
          </button>
        </div>
      </div>
    </div>
  )
}

function QtyInput({ value, max, capped, onChange }) {
  return (
    <span className="qty-field">
      <input
        className={capped != null ? 'qty-input qty-input-capped' : 'qty-input'}
        type="number"
        inputMode="numeric"
        min="0"
        max={max}
        value={value ?? ''}
        placeholder="0"
        onChange={(e) => onChange(e.target.value)}
      />
      {capped != null && <span className="qty-cap">máx {capped}</span>}
    </span>
  )
}
