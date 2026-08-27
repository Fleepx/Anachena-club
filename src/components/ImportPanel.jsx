import { useRef, useState } from 'react'
import { useInventory } from '../store/store.jsx'
import { generarPlanilla, leerPlanilla } from '../lib/planilla.js'
import { clp } from '../lib/inventory.js'

export default function ImportPanel({ type, onDone }) {
  const { items, importItems } = useInventory()
  const fileRef = useRef(null)
  const [lectura, setLectura] = useState(null)
  const [archivo, setArchivo] = useState('')
  const [error, setError] = useState(null)

  const esComida = type === 'consumable'
  const nombreArchivo = esComida ? 'planilla-insumos-comida.csv' : 'planilla-menaje.csv'

  const descargar = () => {
    const csv = generarPlanilla(items, type)
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = nombreArchivo
    a.click()
    URL.revokeObjectURL(url)
  }

  const alElegir = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setError(null)
    setArchivo(f.name)
    try {
      const texto = await f.text()
      const r = leerPlanilla(texto, type, items)
      if (r.vacio) {
        setError('La planilla no tiene filas. ¿Guardaste el archivo después de llenarlo?')
        setLectura(null)
        return
      }
      setLectura(r)
    } catch {
      setError('No se pudo leer el archivo. Tiene que ser un CSV.')
      setLectura(null)
    }
    e.target.value = ''
  }

  const confirmar = () => {
    importItems({ nuevos: lectura.nuevos, actualizados: lectura.actualizados, type })
    onDone?.()
  }

  const total = (lectura?.nuevos.length ?? 0) + (lectura?.actualizados.length ?? 0)

  return (
    <div className="form-panel">
      <div className="form-head">
        <div>
          <h3>Planilla de {esComida ? 'insumos de comida' : 'menaje'}</h3>
          <p>Cargá muchos items de una vez en lugar de uno por uno.</p>
        </div>
      </div>

      <div className="import-steps">
        <div className="import-step">
          <span className="step-n">1</span>
          <div>
            <strong>Descargá la planilla</strong>
            <p>
              Viene con {items.filter((i) => i.type === type).length > 0 ? 'lo que ya está cargado' : 'dos filas de ejemplo'} para
              que se vea el formato
              {esComida && ', incluidas las columnas de merma'}.
            </p>
            <button className="btn btn-ghost" onClick={descargar}>
              Descargar planilla
            </button>
          </div>
        </div>

        <div className="import-step">
          <span className="step-n">2</span>
          <div>
            <strong>Llenala en Excel</strong>
            <p>
              El <em>nombre</em> es la llave: si ya existe se actualiza, si no se crea. Guardá
              el archivo como CSV.
            </p>
          </div>
        </div>

        <div className="import-step">
          <span className="step-n">3</span>
          <div>
            <strong>Subila</strong>
            <p>Antes de aplicar nada te muestro qué va a cambiar.</p>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={alElegir}
              hidden
            />
            <button className="btn btn-primary" onClick={() => fileRef.current?.click()}>
              Elegir archivo
            </button>
            {archivo && <span className="import-file">{archivo}</span>}
          </div>
        </div>
      </div>

      {error && <p className="error-line">{error}</p>}

      {lectura && (
        <div className="import-preview">
          <div className="preview-nums">
            <span className="prev-ok">{lectura.nuevos.length} nuevos</span>
            <span className="prev-upd">{lectura.actualizados.length} se actualizan</span>
            {lectura.errores.length > 0 && (
              <span className="prev-err">{lectura.errores.length} con problemas</span>
            )}
          </div>

          {lectura.intactos.length > 0 && (
            <p className="preview-keep">
              Los otros <strong>{lectura.intactos.length}</strong> items del inventario no
              vienen en la planilla y <strong>quedan como están</strong>. Subir una planilla
              parcial no borra nada.
            </p>
          )}

          {lectura.errores.length > 0 && (
            <ul className="preview-errors">
              {lectura.errores.slice(0, 6).map((e, i) => (
                <li key={i}>
                  Fila {e.fila}
                  {e.nombre ? ' (' + e.nombre + ')' : ''}: {e.motivo}
                </li>
              ))}
              {lectura.errores.length > 6 && <li>y {lectura.errores.length - 6} más…</li>}
            </ul>
          )}

          {lectura.actualizados.length > 0 && (
            <div className="table-wrap">
              <table className="table table-compact">
                <thead>
                  <tr>
                    <th>Se actualiza</th>
                    <th className="num">Cantidad</th>
                    <th className="num">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {lectura.actualizados.slice(0, 8).map((a) => {
                    const cambiaStock = a.antes.stockOnHand !== a.datos.stockOnHand
                    const cambiaPrecio = a.antes.unitCost !== a.datos.unitCost
                    return (
                      <tr key={a.id}>
                        <td>
                          <span className="cell-name">{a.datos.name}</span>
                        </td>
                        <td className="num">
                          {cambiaStock ? (
                            <>
                              <span className="muted">{a.antes.stockOnHand}</span>
                              <span className="arrow"> → </span>
                              <span className="qty qty-gross">{a.datos.stockOnHand}</span>
                            </>
                          ) : (
                            <span className="muted">sin cambio</span>
                          )}
                        </td>
                        <td className="num">
                          {cambiaPrecio ? (
                            <>
                              <span className="muted">{clp(a.antes.unitCost)}</span>
                              <span className="arrow"> → </span>
                              <span className="qty qty-gross">{clp(a.datos.unitCost)}</span>
                            </>
                          ) : (
                            <span className="muted">sin cambio</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {lectura.actualizados.length > 8 && (
                <p className="block-empty">y {lectura.actualizados.length - 8} más</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="form-foot">
        <div className="form-total">
          <span>{lectura ? 'Listo para aplicar' : 'Sin planilla cargada'}</span>
          <strong>{lectura ? total + ' items' : '—'}</strong>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => onDone?.()}>
            Cerrar
          </button>
          <button className="btn btn-primary" disabled={!total} onClick={confirmar}>
            Aplicar al inventario
          </button>
        </div>
      </div>
    </div>
  )
}
