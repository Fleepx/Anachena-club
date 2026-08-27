import { useState } from 'react'
import { useInventory } from '../store/store.jsx'
import { checkAccess } from '../lib/gitstore.js'

export default function SyncPanel({ onDone }) {
  const { syncOn, connect, disconnect } = useInventory()
  const [owner, setOwner] = useState('Fleepx')
  const [repo, setRepo] = useState('Anachena-datos')
  const [token, setToken] = useState('')
  const [probando, setProbando] = useState(false)
  const [error, setError] = useState(null)

  const conectar = async () => {
    setProbando(true)
    setError(null)
    const cfg = { owner: owner.trim(), repo: repo.trim(), token: token.trim() }
    try {
      await checkAccess(cfg)
      connect(cfg)
      onDone?.()
    } catch (e) {
      setError(e.message)
    } finally {
      setProbando(false)
    }
  }

  if (syncOn) {
    return (
      <div className="form-panel">
        <div className="form-head">
          <div>
            <h3>Sincronización activa</h3>
            <p>Este equipo comparte los datos con los demás dispositivos conectados.</p>
          </div>
        </div>
        <div className="form-foot">
          <span className="report-hint">
            Al desconectar, este equipo vuelve a guardar solo para sí mismo.
          </span>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={() => onDone?.()}>
              Cerrar
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                disconnect()
                onDone?.()
              }}
            >
              Desconectar este equipo
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="form-panel">
      <div className="form-head">
        <div>
          <h3>Conectar este equipo</h3>
        </div>
      </div>

      <div className="form-grid">
        <label>
          <span>Cuenta</span>
          <input type="text" value={owner} onChange={(e) => setOwner(e.target.value)} />
        </label>
        <label>
          <span>Repositorio de datos</span>
          <input type="text" value={repo} onChange={(e) => setRepo(e.target.value)} />
        </label>
        <label className="wide">
          <span>Token de acceso</span>
          <input
            type="password"
            value={token}
            placeholder="Pegá acá el token"
            onChange={(e) => setToken(e.target.value)}
          />
        </label>
      </div>

      {error && <p className="error-line">{error}</p>}

      <div className="form-foot">
        <span className="report-hint">
          El token queda guardado solo en este navegador.
        </span>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => onDone?.()}>
            Ahora no
          </button>
          <button
            className="btn btn-primary"
            disabled={probando || !token.trim()}
            onClick={conectar}
          >
            {probando ? 'Probando...' : 'Conectar'}
          </button>
        </div>
      </div>
    </div>
  )
}
