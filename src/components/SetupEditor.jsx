import { useMemo, useState } from 'react'
import { useInventory } from '../store/store.jsx'
import { CATEGORIES } from '../data/items.js'
import { clp, totalYield } from '../lib/inventory.js'

const round = (n) => Math.ceil(n - 0.000001)

const LABEL = Object.fromEntries(
  [...CATEGORIES.asset, ...CATEGORIES.consumable].map((c) => [c.id, c.label])
)

const KINDS = [
  { id: 'setup', label: 'Montajes', sing: 'montaje', nuevo: 'Nuevo montaje', hint: 'El menaje que lleva cada tipo de evento' },
  { id: 'menu', label: 'Menús', sing: 'menú', nuevo: 'Nuevo menú', hint: 'Lo que se cocina. Se elige en cada evento' },
  { id: 'cocktail', label: 'Cócteles', sing: 'cóctel', nuevo: 'Nuevo cóctel', hint: 'Los bocados que se sirven antes' }
]

export default function SetupEditor() {
  const { setups: templates, items, itemById, events, setupPatch, setupLine, createSetup, deleteSetup, canEdit } =
    useInventory()

  const [kind, setKind] = useState('setup')
  const setups = templates.filter((t) => (t.kind ?? 'setup') === kind)

  const [setupId, setSetupId] = useState(setups[0]?.id)
  const [simGuests, setSimGuests] = useState(200)
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState('')

  const setup = setups.find((s) => s.id === setupId) ?? setups[0]
  const usedBy = events.filter(
    (e) => e.setupId === setup?.id || e.menuId === setup?.id || e.cocktailId === setup?.id
  ).length
  const meta = KINDS.find((k) => k.id === kind)

  const rows = useMemo(() => {
    if (!setup) return []
    return setup.lines
      .map((l) => {
        const item = itemById[l.itemId]
        if (!item) return null
        const total = l.perGuest != null ? round(l.perGuest * simGuests) : l.qty
        const rate = totalYield(item)
        return { line: l, item, total, gross: rate < 1 ? round(total / rate) : total, rate }
      })
      .filter(Boolean)
      .sort((a, b) => a.item.name.localeCompare(b.item.name))
  }, [setup, itemById, simGuests])

  const costoConsumibles = rows
    .filter((r) => r.item.type === 'consumable')
    .reduce((s, r) => s + r.gross * r.item.unitCost, 0)

  const sinUsar = items.filter((i) => !setup?.lines.some((l) => l.itemId === i.id))

  return (
    <>
      <section className="page-head">
        <div className="section-head">
          <h2>Plantillas</h2>
        </div>
        <div className="page-actions">
          {canEdit && !adding && (
            <button className="btn btn-primary" onClick={() => setAdding(true)}>
              {meta.nuevo}
            </button>
          )}
          <label className="month-select">
            <span>{meta.sing}</span>
            <select value={setup?.id ?? ''} onChange={(e) => setSetupId(e.target.value)}>
              {setups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="chips chips-months">
        {KINDS.map((k) => {
          const n = templates.filter((t) => (t.kind ?? 'setup') === k.id).length
          return (
            <button
              key={k.id}
              className={kind === k.id ? 'chip chip-active' : 'chip'}
              onClick={() => {
                setKind(k.id)
                const primera = templates.find((t) => (t.kind ?? 'setup') === k.id)
                setSetupId(primera?.id)
                setAdding(false)
              }}
            >
              {k.label} ({n})
            </button>
          )
        })}
      </div>
      <p className="kind-hint">{meta.hint}</p>

      {!setup && (
        <p className="empty">
          No hay {meta.label.toLowerCase()} todavía. Creá el primero con el botón de arriba.
        </p>
      )}

      {setup && adding && (
        <div className="add-panel">
          <div className="form-panel">
            <div className="form-head">
              <div>
                <h3>{meta.nuevo}</h3>
                <p>Arranca como una copia de {setup?.name}.</p>
              </div>
            </div>
            <div className="form-grid">
              <label className="wide">
                <span>Nombre</span>
                <input
                  type="text"
                  value={newName}
                  placeholder="Ej: Bautizo, Aniversario"
                  onChange={(e) => setNewName(e.target.value)}
                />
              </label>
            </div>
            <div className="form-foot">
              <div className="form-total">
                <span>Copia de</span>
                <strong>{setup?.name}</strong>
              </div>
              <div className="form-actions">
                <button className="btn btn-ghost" onClick={() => setAdding(false)}>
                  Cancelar
                </button>
                <button
                  className="btn btn-primary"
                  disabled={!newName.trim()}
                  onClick={() => {
                    createSetup({ name: newName, basedOn: setup?.id, kind })
                    setNewName('')
                    setAdding(false)
                  }}
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {setup && (
      <>
      <section className="stats">
        <div className="stat">
          <strong className="stat-value">{setup.lines.length}</strong>
          <span className="stat-label">Items en el {meta.sing}</span>
        </div>
        <div className="stat">
          <strong className="stat-value">{usedBy}</strong>
          <span className="stat-label">{usedBy === 1 ? 'Evento lo usa' : 'Eventos lo usan'}</span>
        </div>
        <div className="stat">
          <strong className="stat-value stat-value-sm">{clp(costoConsumibles)}</strong>
          <span className="stat-label">Comida y bebida para {simGuests}</span>
        </div>
      </section>

      <div className="setup-bar">
        <label className="setup-name">
          <span>Nombre</span>
          <input
            type="text"
            value={setup.name}
            onChange={(e) => setupPatch(setup.id, { name: e.target.value })}
          />
        </label>

        <label className="setup-sim">
          <span>Simular para</span>
          <input
            type="number"
            min="1"
            value={simGuests}
            onChange={(e) => setSimGuests(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
          />
          <em>personas</em>
        </label>

        {usedBy === 0 && setups.length > 1 && (
          <button className="link-btn danger" onClick={() => deleteSetup(setup.id)}>
            Borrar plantilla
          </button>
        )}
      </div>

      <LineTable
        title="Comida y bebida"
        rows={rows.filter((r) => r.item.type === 'consumable')}
        simGuests={simGuests}
        showGross
        setupId={setup.id}
        setupLine={setupLine}
      />

      <LineTable
        title="Menaje e inmueble"
        rows={rows.filter((r) => r.item.type === 'asset')}
        simGuests={simGuests}
        setupId={setup.id}
        setupLine={setupLine}
      />

      <div className="setup-add">
        <label>
          <span>Agregar item al montaje</span>
          <select
            value=""
            onChange={(e) => e.target.value && setupLine(setup.id, e.target.value, { perGuest: 1 })}
          >
            <option value="">Elegí un item...</option>
            {sinUsar.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name} ({LABEL[i.category]})
              </option>
            ))}
          </select>
        </label>
        {sinUsar.length === 0 && <p className="block-empty">Ya están todos los items.</p>}
      </div>
      </>
      )}
    </>
  )
}

function LineTable({ title, rows, simGuests, showGross, setupId, setupLine }) {
  if (rows.length === 0) return null

  return (
    <div className="purchase-block">
      <h3 className="block-title">{title}</h3>
      {(
        <div className="table-wrap">
          <table className="table table-compact">
            <thead>
              <tr>
                <th>Item</th>
                <th className="num">Cantidad</th>
                <th>Modo</th>
                <th className="num">{showGross ? 'Receta p/ ' : 'Para '}{simGuests}</th>
                {showGross && (
                  <th
                    className="num th-help"
                    title="Cuánto hay que comprar para que llegue al plato lo que pide la receta. Un lomo se compra con grasa y cordón: rinde 75%, así que para 50 kg de receta hay que comprar 67. Un producto que rinde 100% se usa entero y se compra igual que la receta."
                  >
                    Comprar
                  </th>
                )}
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ line, item, total, gross, rate }) => {
                const porPersona = line.perGuest != null
                return (
                  <tr key={item.id}>
                    <td>
                      <span className="cell-name">{item.name}</span>
                      <span className="cell-unit">{LABEL[item.category]}</span>
                    </td>
                    <td className="num">
                      <input
                        className="qty-input"
                        type="number"
                        min="0"
                        step={porPersona ? '0.01' : '1'}
                        value={porPersona ? line.perGuest : line.qty}
                        onChange={(e) => {
                          const v = Math.max(0, Number(e.target.value) || 0)
                          setupLine(
                            setupId,
                            item.id,
                            porPersona ? { perGuest: v } : { qty: Math.floor(v) }
                          )
                        }}
                      />
                    </td>
                    <td>
                      <select
                        className="mode-select"
                        value={porPersona ? 'guest' : 'fixed'}
                        onChange={(e) =>
                          setupLine(
                            setupId,
                            item.id,
                            e.target.value === 'guest'
                              ? { perGuest: line.qty != null ? line.qty / simGuests : 1 }
                              : { qty: total }
                          )
                        }
                      >
                        <option value="guest">por persona</option>
                        <option value="fixed">cantidad fija</option>
                      </select>
                    </td>
                    <td className="num">
                      <span className="qty">{total}</span>
                      <span className="unit">{item.unit}</span>
                    </td>
                    {showGross && (
                      <td className="num">
                        <span className={rate < 1 ? 'qty qty-gross' : 'qty muted'}>{gross}</span>
                        <span className="unit">rinde {Math.round(rate * 100)}%</span>
                      </td>
                    )}
                    <td className="num">
                      <button
                        className="link-btn danger"
                        onClick={() => setupLine(setupId, item.id, null)}
                      >
                        Quitar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
