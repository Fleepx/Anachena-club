import { useState } from 'react'
import { useInventory } from '../store/store.jsx'
import { reportCost } from '../lib/monthly.js'
import { clp, formatDate, monthKey, monthLabel, isPast } from '../lib/inventory.js'
import BreakageForm from './BreakageForm.jsx'
import Collapse from './Collapse.jsx'
import { descargarActa } from '../lib/acta.js'
import { CHARGE_THRESHOLD } from '../data/config.js'

const REASON = { broken: 'Rota', missing: 'No volvió' }

const lineLabel = (n) => (n === 0 ? 'sin roturas' : n + (n === 1 ? ' línea' : ' líneas'))

export default function BreakageView() {
  const {
    itemById,
    setupById,
    reports,
    reportByEvent,
    reset,
    today,
    events,
    dropDemoEvents,
    canEdit,
    confirmReport,
    discardReport
  } = useInventory()
  const [closing, setClosing] = useState(null)
  const [busy, setBusy] = useState(null)
  const [error, setError] = useState(null)

  const emitirActa = async (event, report, docNumber) => {
    setBusy(report.id)
    setError(null)
    try {
      await descargarActa({ event, report, itemById, setupById, docNumber, issuedAt: today })
    } catch {
      setError('No se pudo generar el acta. Intentá de nuevo.')
    } finally {
      setBusy(null)
    }
  }

  const past = events
    .filter((e) => isPast(e, today))
    .sort((a, b) => b.date.localeCompare(a.date))

  const pending = past.filter((e) => !reportByEvent[e.id])
  const borradores = past.filter((e) => reportByEvent[e.id]?.status === 'draft')
  const closed = past.filter((e) => reportByEvent[e.id]?.status !== 'draft' && reportByEvent[e.id])

  const confirmados = reports.filter((r) => r.status !== 'draft')
  const totalLost = confirmados.reduce((s, r) => s + reportCost(r, itemById), 0)
  const thisMonth = confirmados.filter((r) => monthKey(r.closedAt) === monthKey(today))
  const monthLost = thisMonth.reduce((s, r) => s + reportCost(r, itemById), 0)

  const event = closing ? past.find((e) => e.id === closing) : null

  return (
    <>
      <section className="section-head section-head-page">
        <h2>Roturas y bajas</h2>
        <p>Se levanta al terminar cada evento. Lo que se carga acá descuenta del inventario.</p>
      </section>

      <section className="stats">
        <div className={'stat' + (pending.length ? ' stat-warn' : ' stat-ok')}>
          <strong className="stat-value">{pending.length}</strong>
          <span className="stat-label">Eventos por cerrar</span>
        </div>
        <div className={'stat' + (borradores.length ? ' stat-warn' : '')}>
          <strong className="stat-value">{borradores.length}</strong>
          <span className="stat-label">
            {borradores.length === 1 ? 'Conteo por revisar' : 'Conteos por revisar'}
          </span>
        </div>
        <div className="stat stat-warn">
          <strong className="stat-value stat-value-sm">{clp(monthLost)}</strong>
          <span className="stat-label">Perdido en {monthLabel(monthKey(today))}</span>
        </div>
        <div className="stat stat-warn">
          <strong className="stat-value stat-value-sm">{clp(totalLost)}</strong>
          <span className="stat-label">Perdido acumulado</span>
        </div>
      </section>

      {event && (
        <section className="section">
          <BreakageForm event={event} onDone={() => setClosing(null)} />
        </section>
      )}

      {pending.length > 0 && !event && (
        <section className="section">
          <div className="section-head">
            <h2>Por cerrar</h2>
            <p>Eventos que ya pasaron y no tienen parte de roturas.</p>
          </div>
          <div className="event-list">
            {pending.map((e) => (
              <article key={e.id} className="event event-pending">
                <div className="pending-row">
                  <div>
                    <span className="event-title">
                      {e.clientName}
                      {e.demo && <span className="tag-demo">prueba</span>}
                    </span>
                    <span className="event-meta">
                      {formatDate(e.date)} · {e.guestCount} personas
                    </span>
                  </div>
                  <button className="btn btn-primary" onClick={() => setClosing(e.id)}>
                    {canEdit ? 'Levantar parte' : 'Cargar conteo'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {borradores.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Conteos por revisar</h2>
            <p>
              {canEdit
                ? 'Cargados por el personal. El stock se descuenta recién al confirmar.'
                : 'Ya los cargaste. Falta que el admin los confirme.'}
            </p>
          </div>
          <div className="event-list">
            {borradores.map((e) => {
              const report = reportByEvent[e.id]
              return (
                <article key={e.id} className="event event-draft">
                  <div className="report-head">
                    <div>
                      <span className="event-title">
                        {e.clientName}
                        {e.demo && <span className="tag-demo">prueba</span>}
                      </span>
                      <span className="event-meta">
                        {formatDate(e.date)} · contado por {report.closedBy} ·{' '}
                        {lineLabel(report.lines.length)}
                      </span>
                    </div>
                    <div className="report-right">
                      <span className="badge badge-draft">Sin confirmar</span>
                      <span className="report-cost">{clp(reportCost(report, itemById))}</span>
                    </div>
                  </div>

                  <ul className="report-lines">
                    {report.lines.map((l, i) => {
                      const item = itemById[l.itemId]
                      if (!item) return null
                      return (
                        <li key={i}>
                          <span className="rl-qty">{l.qty}</span>
                          <span className="rl-name">{item.name}</span>
                          <span className={'rl-reason rl-' + l.reason}>{REASON[l.reason]}</span>
                          <span className="rl-cost">{clp(l.qty * item.unitCost)}</span>
                        </li>
                      )
                    })}
                  </ul>
                  {report.note && <p className="report-note">{report.note}</p>}

                  <div className="report-foot">
                    <span className="report-hint">
                      {report.lines.length === 0
                        ? canEdit
                          ? 'No hay bajas que aplicar. Al confirmar el evento queda cerrado.'
                          : 'Contaste todo y volvió completo. Falta que el admin lo cierre.'
                        : canEdit
                          ? 'Al confirmar se da de baja del inventario y se habilita el acta.'
                          : 'Todavía no se descontó del inventario.'}
                    </span>
                    {canEdit && (
                      <div className="form-actions">
                        <button className="btn btn-ghost" onClick={() => discardReport(report.id)}>
                          Descartar
                        </button>
                        <button
                          className="btn btn-primary"
                          onClick={() => confirmReport(report.id, 'Admin')}
                        >
                          Confirmar y dar de baja
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h2>Historial</h2>
          <p>Qué se rompió, en qué evento y cuánto costó.</p>
        </div>
        <div className="event-list">
          {closed.map((e, idx) => (
            <ReportCard
              key={e.id}
              event={e}
              report={reportByEvent[e.id]}
              itemById={itemById}
              docNumber={100 + closed.length - idx}
              busy={busy}
              canEdit={canEdit}
              onEmitir={emitirActa}
            />
          ))}
        </div>
      </section>

      {error && <p className="error-line">{error}</p>}

      <p className="reset-line">
        Los datos viven en este navegador.{' '}
        <button className="link-btn" onClick={reset}>
          Volver a los datos de ejemplo
        </button>
        {events.some((e) => e.demo) && (
          <>
            {' · '}
            <button className="link-btn" onClick={dropDemoEvents}>
              Borrar los {events.filter((e) => e.demo).length} eventos de prueba
            </button>
          </>
        )}
      </p>
    </>
  )
}

function ReportCard({ event, report, itemById, docNumber, busy, canEdit, onEmitir }) {
  const [open, setOpen] = useState(false)
  const cost = reportCost(report, itemById)
  const chargeable = cost >= CHARGE_THRESHOLD
  const clean = report.lines.length === 0

  return (
    <article className={open ? 'event event-open' : 'event'}>
      <button className="report-head report-head-btn" onClick={() => setOpen(!open)}>
        <div>
          <span className="event-title">
            {event.clientName}
            {event.demo && <span className="tag-demo">prueba</span>}
          </span>
          <span className="event-meta">
            {formatDate(event.date)} · {lineLabel(report.lines.length)} · cerrado por{' '}
            {report.closedBy}
          </span>
        </div>
        <div className="report-right">
          {chargeable && <span className="badge badge-danger">Sobre el umbral</span>}
          <span className="report-cost">{clp(cost)}</span>
          <span className={open ? 'chev chev-open' : 'chev'}>&#8250;</span>
        </div>
      </button>

      <Collapse open={open}>
          <ul className="report-lines">
            {report.lines.map((l, i) => {
              const item = itemById[l.itemId]
              if (!item) return null
              return (
                <li key={i}>
                  <span className="rl-qty">{l.qty}</span>
                  <span className="rl-name">{item.name}</span>
                  <span className={'rl-reason rl-' + l.reason}>{REASON[l.reason]}</span>
                  <span className="rl-cost">{clp(l.qty * item.unitCost)}</span>
                </li>
              )
            })}
          </ul>
          {clean && <p className="report-note">Se contó el menaje y volvió completo.</p>}
          {report.note && <p className="report-note">{report.note}</p>}
          <div className="report-foot">
            <span className="report-hint">
              {clean
                ? 'No hay nada que cobrar.'
                : chargeable
                  ? 'Supera ' + clp(CHARGE_THRESHOLD) + '. Cobrar o no lo decide el cliente.'
                  : 'Bajo el umbral de ' + clp(CHARGE_THRESHOLD) + '.'}
            </span>
            {canEdit && !clean && (
              <button
                className="btn btn-primary"
                disabled={busy === report.id}
                onClick={() => onEmitir(event, report, docNumber)}
              >
                {busy === report.id ? 'Generando...' : 'Generar acta de cobro'}
              </button>
            )}
          </div>
      </Collapse>
    </article>
  )
}
