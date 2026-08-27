import { useState } from 'react'
import { InventoryProvider, useInventory } from './store/store.jsx'
import { formatDate, realToday } from './lib/inventory.js'
import SyncPanel from './components/SyncPanel.jsx'
import Dashboard from './components/Dashboard.jsx'
import MonthlyPlan from './components/MonthlyPlan.jsx'
import InventoryView from './components/InventoryView.jsx'
import BreakageView from './components/BreakageView.jsx'
import SetupEditor from './components/SetupEditor.jsx'
import FinanceView from './components/FinanceView.jsx'

const TABS = [
  { id: 'summary', label: 'Resumen' },
  { id: 'month', label: 'Mes' },
  { id: 'food', label: 'Insumos de comida' },
  { id: 'assets', label: 'Menaje e inmueble' },
  { id: 'setups', label: 'Plantillas' },
  { id: 'finance', label: 'Balance' },
  { id: 'breakage', label: 'Roturas' }
]

function DateControl() {
  const { today, simulatedDate, setDate, role, setRole } = useInventory()

  return (
    <div className="date-control">
      <label>
        <span>Perfil</span>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="admin">Admin</option>
          <option value="staff">Personal</option>
        </select>
      </label>
      <label>
        <span>Día del sistema</span>
        <input type="date" value={today} onChange={(e) => setDate(e.target.value)} />
      </label>
      {simulatedDate && simulatedDate !== realToday() && (
        <button className="link-btn" onClick={() => setDate(null)}>
          Volver a hoy
        </button>
      )}
    </div>
  )
}

const SIN_SYNC_KEY = 'cac_sin_sync'

function Bienvenida({ onLocal }) {
  return (
    <div className="welcome">
      <div className="welcome-box">
        <img
          className="welcome-logo"
          src={import.meta.env.BASE_URL + 'brand/wordmark-negro.png'}
          alt="Anachena"
        />
        <p className="welcome-lead">
          Conectá este equipo para trabajar con la misma información que el resto de los
          dispositivos.
        </p>
        <SyncPanel onDone={onLocal} />
      </div>
    </div>
  )
}

function Shell() {
  const [tab, setTab] = useState('summary')
  const { canEdit, syncOn, syncError, syncing } = useInventory()
  const [conectando, setConectando] = useState(false)
  const [soloLocal, setSoloLocal] = useState(
    () => localStorage.getItem(SIN_SYNC_KEY) === '1'
  )

  const visibles = TABS.filter((t) => t.id !== 'finance' || canEdit)
  const activa = visibles.some((t) => t.id === tab) ? tab : 'summary'

  if (!syncOn && !soloLocal) {
    return (
      <Bienvenida
        onLocal={() => {
          localStorage.setItem(SIN_SYNC_KEY, '1')
          setSoloLocal(true)
        }}
      />
    )
  }

  return (
    <div className="app">
      <header className="topbar">
          <div className="topbar-inner">
            <div className="brand">
              <img className="brand-mark" src={import.meta.env.BASE_URL + 'brand/isotipo.png'} alt="" />
              <div className="brand-text">
                <h1>
                  <img className="brand-word" src={import.meta.env.BASE_URL + 'brand/wordmark-negro.png'} alt="Anachena" />
                </h1>
                <p>Salón de eventos · Inventario</p>
              </div>
            </div>
            <DateControl />
            <button
              className={syncOn ? 'sync-chip sync-chip-on' : 'sync-chip sync-chip-off'}
              onClick={() => setConectando(true)}
            >
              {syncOn ? (syncing ? 'Guardando...' : 'Sincronizado') : 'Sin sincronizar'}
            </button>
          </div>
          <nav className="tabs">
            {visibles.map((t) => (
              <button
                key={t.id}
                className={activa === t.id ? 'tab tab-active' : 'tab'}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </header>

        {syncError && <p className="sync-warn">{syncError}</p>}

        {conectando && (
          <div className="content">
            <SyncPanel
              onDone={() => {
                setConectando(false)
                localStorage.setItem(SIN_SYNC_KEY, '1')
              }}
            />
          </div>
        )}

        <main className="content" key={activa}>
          {activa === 'summary' && <Dashboard onGoTo={setTab} />}
          {activa === 'month' && <MonthlyPlan />}
          {activa === 'food' && (
            <InventoryView
              type="consumable"
              title="Insumos de comida"
              subtitle="Se gastan en el evento y no vuelven. Lo que importa es reponer a tiempo."
            />
          )}
          {activa === 'assets' && (
            <InventoryView
              type="asset"
              title="Menaje e inmueble"
              subtitle="Sale al evento y vuelve. Lo que importa es cuánto se rompe."
            />
          )}
          {activa === 'setups' && <SetupEditor />}
          {activa === 'finance' && <FinanceView />}
          {activa === 'breakage' && <BreakageView />}
        </main>
    </div>
  )
}

export default function App() {
  return (
    <InventoryProvider>
      <Shell />
    </InventoryProvider>
  )
}
