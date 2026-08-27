import { useState } from 'react'
import { useInventory } from '../store/store.jsx'
import { warehouses } from '../data/warehouses.js'

const enBodega = (item, id) =>
  item.stock ? item.stock[id] ?? 0 : item.warehouse === id ? item.stockOnHand : 0

export default function MoveStock({ item, destinos, onDone }) {
  const { moveStock } = useInventory()

  const conStock = destinos.filter((w) => enBodega(item, w.id) > 0)
  const [from, setFrom] = useState(conStock[0]?.id ?? destinos[0].id)
  const [to, setTo] = useState(destinos.find((w) => w.id !== (conStock[0]?.id ?? destinos[0].id))?.id)
  const [qty, setQty] = useState('')

  const disponible = enBodega(item, from)
  const cantidad = Math.min(Math.max(Math.floor(Number(qty) || 0), 0), disponible)

  const mover = () => {
    if (cantidad <= 0 || from === to) return
    moveStock({ itemId: item.id, from, to, qty: cantidad })
    onDone?.()
  }

  return (
    <div className="form-panel">
      <div className="form-head">
        <div>
          <h3>Mover {item.name}</h3>
          <p>
            {destinos
              .map((w) => w.name + ': ' + enBodega(item, w.id))
              .join(' · ')}
          </p>
        </div>
      </div>

      <div className="form-grid">
        <label>
          <span>Desde</span>
          <select
            value={from}
            onChange={(e) => {
              setFrom(e.target.value)
              if (e.target.value === to) {
                setTo(destinos.find((w) => w.id !== e.target.value)?.id)
              }
            }}
          >
            {destinos.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name} ({enBodega(item, w.id)})
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Hacia</span>
          <select value={to} onChange={(e) => setTo(e.target.value)}>
            {destinos
              .filter((w) => w.id !== from)
              .map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
          </select>
        </label>

        <label>
          <span>Cantidad</span>
          <input
            type="number"
            min="0"
            max={disponible}
            value={qty}
            placeholder="0"
            onChange={(e) => setQty(e.target.value)}
          />
          {Number(qty) > disponible && (
            <span className="field-warn">
              En {warehouses.find((w) => w.id === from)?.name} hay {disponible}.
            </span>
          )}
        </label>
      </div>

      <div className="form-foot">
        <div className="form-total">
          <span>{cantidad > 0 ? 'Se mueven ' + cantidad : 'Sin mover'}</span>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => onDone?.()}>
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={cantidad <= 0} onClick={mover}>
            Mover
          </button>
        </div>
      </div>
    </div>
  )
}
