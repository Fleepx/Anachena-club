import { useMemo, useState } from 'react'
import { CATEGORIES } from '../data/items.js'
import { warehouses, warehouseById } from '../data/warehouses.js'
import { useInventory } from '../store/store.jsx'
import { clp, totalYield } from '../lib/inventory.js'
import AddItemForm from './AddItemForm.jsx'
import ImportPanel from './ImportPanel.jsx'

export default function InventoryView({ type, title, subtitle }) {
  const { items, itemPatch, canEdit } = useInventory()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [bodega, setBodega] = useState('all')
  const [adding, setAdding] = useState(false)
  const [importing, setImporting] = useState(false)

  const categories = CATEGORIES[type]
  const pool = useMemo(() => items.filter((i) => i.type === type), [items, type])

  const visible = pool.filter((i) => {
    const matchCat = category === 'all' || i.category === category
    const matchBod = bodega === 'all' || i.warehouse === bodega
    const matchText = i.name.toLowerCase().includes(query.trim().toLowerCase())
    return matchCat && matchBod && matchText
  })

  const conteoPorBodega = Object.fromEntries(
    warehouses.map((w) => [w.id, pool.filter((i) => i.warehouse === w.id).length])
  )

  const isFood = type === 'consumable'
  const alerts = pool.filter((i) =>
    isFood ? i.stockOnHand < (i.minStock ?? 0) : i.stockBroken > 0
  )
  const brokenValue = pool.reduce((s, i) => s + (i.stockBroken ?? 0) * i.unitCost, 0)

  return (
    <>
      <section className="page-head">
        <div className="section-head">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="page-actions">
          {canEdit && !importing && (
            <button
              className="btn btn-ghost"
              onClick={() => {
                setImporting(true)
                setAdding(false)
              }}
            >
              Planilla
            </button>
          )}
          {canEdit && !adding && (
            <button
              className="btn btn-primary"
              onClick={() => {
                setAdding(true)
                setImporting(false)
              }}
            >
              Añadir item
            </button>
          )}
        </div>
      </section>

      {importing && (
        <div className="add-panel">
          <ImportPanel type={type} onDone={() => setImporting(false)} />
        </div>
      )}

      {adding && (
        <div className="add-panel">
          <AddItemForm type={type} onDone={() => setAdding(false)} />
        </div>
      )}

      <section className="stats">
        <div className="stat">
          <strong className="stat-value">{pool.length}</strong>
          <span className="stat-label">Items en catálogo</span>
        </div>
        <div className={'stat' + (alerts.length ? ' stat-warn' : ' stat-ok')}>
          <strong className="stat-value">{alerts.length}</strong>
          <span className="stat-label">{isFood ? 'Bajo el mínimo' : 'Con unidades rotas'}</span>
        </div>
        {!isFood && (
          <div className="stat stat-warn">
            <strong className="stat-value stat-value-sm">{clp(brokenValue)}</strong>
            <span className="stat-label">Perdido en roturas</span>
          </div>
        )}
      </section>

      <div className="filters">
        <input
          className="search"
          type="search"
          placeholder="Buscar item..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="bodega-tabs">
          <button
            className={bodega === 'all' ? 'bodega bodega-active' : 'bodega'}
            onClick={() => setBodega('all')}
          >
            <span className="bodega-letra">Todo</span>
            <span className="bodega-n">{pool.length}</span>
          </button>
          {warehouses.map((w) => {
            const n = conteoPorBodega[w.id]
            return (
              <button
                key={w.id}
                className={
                  'bodega' +
                  (bodega === w.id ? ' bodega-active' : '') +
                  (n === 0 ? ' bodega-vacia' : '')
                }
                onClick={() => setBodega(w.id)}
                title={w.desc}
              >
                <span className="bodega-letra">{w.letter}</span>
                <span className="bodega-sub">{w.subtitle}</span>
                <span className="bodega-n">{n}</span>
              </button>
            )
          })}
        </div>
        <div className="chips">
          <button
            className={category === 'all' ? 'chip chip-active' : 'chip'}
            onClick={() => setCategory('all')}
          >
            Todo
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              className={category === c.id ? 'chip chip-active' : 'chip'}
              onClick={() => setCategory(c.id)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Item</th>
              <th className="num">Disponible</th>
              <th className="num">{isFood ? 'Mínimo' : 'Rotas'}</th>
              {isFood && (
                <>
                  <th
                    className="num th-help"
                    title="Lo que se pierde al limpiar, pelar o deshuesar, antes de cocinar. Un lomo rinde 75%: de 1 kg comprado quedan 750 g limpios y el resto es grasa y cordón."
                  >
                    Limpieza
                  </th>
                  <th
                    className="num th-help"
                    title="Lo que pasa en el fuego. La carne pierde agua y grasa: un bife queda en 84%, una pechuga en 75%. El arroz y las pastas al revés, ganan peso: 1 kg crudo rinde 2,8 kg servidos, o sea 280%. Lo que no se cocina va en 100%."
                  >
                    Cocción
                  </th>
                  <th
                    className="num th-help"
                    title="Las dos mermas juntas: cuánto de lo comprado llega efectivamente al plato."
                  >
                    Rinde
                  </th>
                </>
              )}
              <th className="hide-sm">Ubicación</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((i) => {
              const low = isFood && i.stockOnHand < (i.minStock ?? 0)
              return (
                <tr key={i.id} className={low ? 'row-low' : undefined}>
                  <td>
                    <span className="cell-name">{i.name}</span>
                    <span className="cell-sub">
                      {categories.find((c) => c.id === i.category)?.label}
                      {i.serialized && ' · ficha individual'}
                    </span>
                  </td>
                  <td className="num">
                    <span className={low ? 'qty qty-low' : 'qty'}>{i.stockOnHand}</span>
                    <span className="unit">{i.unit}</span>
                  </td>
                  <td className="num">
                    {isFood ? (
                      <span className="muted">{i.minStock}</span>
                    ) : i.stockBroken > 0 ? (
                      <span className="broken">{i.stockBroken}</span>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  {isFood && (
                    <>
                      <td className="num">
                        <YieldInput
                          value={i.yieldRate}
                          readOnly={!canEdit}
                          onChange={(v) => itemPatch(i.id, { yieldRate: v })}
                        />
                      </td>
                      <td className="num">
                        <YieldInput
                          value={i.cookingYield}
                          max={400}
                          readOnly={!canEdit}
                          onChange={(v) => itemPatch(i.id, { cookingYield: v })}
                        />
                      </td>
                      <td className="num">
                        <span className={totalYield(i) < 1 ? 'qty qty-gross' : 'qty muted'}>
                          {Math.round(totalYield(i) * 100)}%
                        </span>
                      </td>
                    </>
                  )}
                  <td className="hide-sm">
                    <span className="cell-name">
                      {warehouseById[i.warehouse]?.name ?? 'Sin bodega'}
                    </span>
                    {i.detail && <span className="cell-unit">{i.detail}</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {visible.length === 0 && (
          <p className="empty">
            {bodega !== 'all' && conteoPorBodega[bodega] === 0
              ? 'La ' +
                warehouseById[bodega].name +
                ' no tiene ' +
                (isFood ? 'insumos de comida' : 'menaje') +
                ' cargado.'
              : 'Ningún item coincide con la búsqueda.'}
          </p>
        )}
      </div>
    </>
  )
}

function YieldInput({ value, onChange, max = 100, readOnly }) {
  if (readOnly) {
    return <span className="qty muted">{Math.round((value ?? 1) * 100)}%</span>
  }

  return (
    <span className="yield-field">
      <input
        className="qty-input qty-input-sm"
        type="number"
        min="1"
        max={max}
        value={Math.round((value ?? 1) * 100)}
        onChange={(e) => {
          const v = Math.min(max, Math.max(1, Math.floor(Number(e.target.value) || 0)))
          onChange(v / 100)
        }}
      />
      <em>%</em>
    </span>
  )
}
