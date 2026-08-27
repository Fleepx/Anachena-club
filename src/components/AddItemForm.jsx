import { useState } from 'react'
import { CATEGORIES } from '../data/items.js'
import { warehouses, WAREHOUSE_BY_CATEGORY } from '../data/warehouses.js'
import { useInventory } from '../store/store.jsx'
import { clp } from '../lib/inventory.js'

export default function AddItemForm({ type, onDone }) {
  const { items, addStock, createItem } = useInventory()
  const [mode, setMode] = useState('restock')

  const pool = items.filter((i) => i.type === type)
  const categories = CATEGORIES[type]
  const isFood = type === 'consumable'

  const [itemId, setItemId] = useState(pool[0]?.id ?? '')
  const [qty, setQty] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [note, setNote] = useState('')

  const [name, setName] = useState('')
  const [category, setCategory] = useState(categories[0].id)
  const [unit, setUnit] = useState(isFood ? 'kg' : 'unidad')
  const [minStock, setMinStock] = useState('')
  const [detail, setDetail] = useState('')
  const [warehouse, setWarehouse] = useState('')

  const n = (v) => Math.max(0, Number(v) || 0)
  const selected = pool.find((i) => i.id === itemId)

  const validRestock = selected && n(qty) > 0
  const validNew = name.trim().length > 0 && n(qty) >= 0

  const submit = () => {
    if (mode === 'restock') {
      if (!validRestock) return
      addStock({ itemId, qty: n(qty), unitCost: n(unitCost), note })
    } else {
      if (!validNew) return
      createItem({
        name,
        type,
        category,
        unit,
        qty: n(qty),
        unitCost: n(unitCost),
        minStock: n(minStock),
        warehouse: warehouse || WAREHOUSE_BY_CATEGORY[category],
        detail
      })
    }
    onDone?.()
  }

  const totalCost = n(qty) * (n(unitCost) || selected?.unitCost || 0)

  return (
    <div className="form-panel">
      <div className="form-head">
        <div>
          <h3>Añadir al inventario</h3>
          <p>Registrá una compra o dá de alta algo que no estaba en el catálogo.</p>
        </div>
      </div>

      <div className="mode-switch">
        <button
          className={mode === 'restock' ? 'mode mode-active' : 'mode'}
          onClick={() => setMode('restock')}
        >
          Sumar a uno existente
        </button>
        <button
          className={mode === 'new' ? 'mode mode-active' : 'mode'}
          onClick={() => setMode('new')}
        >
          Item nuevo
        </button>
      </div>

      <div className="form-grid">
        {mode === 'restock' ? (
          <>
            <label className="wide">
              <span>Item</span>
              <select value={itemId} onChange={(e) => setItemId(e.target.value)}>
                {pool.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.name} — hay {i.stockOnHand} {i.unit}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Cantidad que entra</span>
              <input
                type="number"
                min="0"
                value={qty}
                placeholder="0"
                onChange={(e) => setQty(e.target.value)}
              />
            </label>
            <label>
              <span>Precio unitario (opcional)</span>
              <input
                type="number"
                min="0"
                value={unitCost}
                placeholder={selected ? String(selected.unitCost) : '0'}
                onChange={(e) => setUnitCost(e.target.value)}
              />
            </label>
            <label className="wide">
              <span>Nota (opcional)</span>
              <input
                type="text"
                value={note}
                placeholder="Proveedor, N° de factura"
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
          </>
        ) : (
          <>
            <label className="wide">
              <span>Nombre</span>
              <input
                type="text"
                value={name}
                placeholder={isFood ? 'Ej: Pimienta molida' : 'Ej: Copa de cóctel'}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label>
              <span>Categoría</span>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Unidad</span>
              <input
                type="text"
                value={unit}
                placeholder="unidad, kg, litro"
                onChange={(e) => setUnit(e.target.value)}
              />
            </label>
            <label>
              <span>Cantidad inicial</span>
              <input
                type="number"
                min="0"
                value={qty}
                placeholder="0"
                onChange={(e) => setQty(e.target.value)}
              />
            </label>
            <label>
              <span>Precio unitario</span>
              <input
                type="number"
                min="0"
                value={unitCost}
                placeholder="0"
                onChange={(e) => setUnitCost(e.target.value)}
              />
            </label>
            {isFood && (
              <label>
                <span>Stock mínimo</span>
                <input
                  type="number"
                  min="0"
                  value={minStock}
                  placeholder="0"
                  onChange={(e) => setMinStock(e.target.value)}
                />
              </label>
            )}
            <label>
              <span>Bodega</span>
              <select value={warehouse} onChange={(e) => setWarehouse(e.target.value)}>
                <option value="">Según la categoría</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {w.subtitle}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Sector</span>
              <input
                type="text"
                value={detail}
                placeholder={isFood ? 'Cámara de frío' : 'Estante 3'}
                onChange={(e) => setDetail(e.target.value)}
              />
            </label>
          </>
        )}
      </div>

      <div className="form-foot">
        <div className="form-total">
          <span>{mode === 'restock' ? 'Entra al inventario' : 'Alta de item'}</span>
          <strong>{totalCost > 0 ? clp(totalCost) : '—'}</strong>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => onDone?.()}>
            Cancelar
          </button>
          <button
            className="btn btn-primary"
            disabled={mode === 'restock' ? !validRestock : !validNew}
            onClick={submit}
          >
            {mode === 'restock' ? 'Sumar al stock' : 'Crear item'}
          </button>
        </div>
      </div>
    </div>
  )
}
