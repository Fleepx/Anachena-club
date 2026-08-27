import { useMemo, useState } from 'react'
import { useInventory } from '../store/store.jsx'
import { monthlyCashflow, sumMonths, eventMoney } from '../lib/finance.js'
import { clp, monthKey, monthLabel, formatDate, isPast } from '../lib/inventory.js'

export default function FinanceView() {
  const { events, itemById, setupById, reportByEvent, today } = useInventory()

  const flujo = useMemo(
    () => monthlyCashflow(events, itemById, setupById, reportByEvent, today),
    [events, itemById, setupById, reportByEvent, today]
  )

  const [mes, setMes] = useState(monthKey(today))

  const pasados = flujo.filter((m) => m.pasado)
  const porVenir = flujo.filter((m) => !m.pasado && !m.actual)
  const esteMes = flujo.find((m) => m.actual)

  const generado = sumMonths(pasados)
  const proyectado = sumMonths(porVenir)

  const tope = Math.max(...flujo.map((m) => m.income + m.incomeTentative), 1)

  const delMes = events
    .filter((e) => monthKey(e.date) === mes)
    .sort((a, b) => a.date.localeCompare(b.date))

  return (
    <>
      <section className="page-head">
        <div className="section-head">
          <h2>Balance</h2>
        </div>
      </section>

      <section className="stats">
        <div className="stat">
          <strong className="stat-value stat-value-sm">{clp(esteMes?.income ?? 0)}</strong>
          <span className="stat-label">Ingresos de {monthLabel(monthKey(today))}</span>
        </div>
        <div className={'stat' + ((esteMes?.margin ?? 0) >= 0 ? ' stat-ok' : ' stat-warn')}>
          <strong className="stat-value stat-value-sm">{clp(esteMes?.margin ?? 0)}</strong>
          <span className="stat-label">
            Margen del mes {esteMes ? '· ' + Math.round(esteMes.marginPct) + '%' : ''}
          </span>
        </div>
        <div className="stat">
          <strong className="stat-value stat-value-sm">{clp(generado.margin)}</strong>
          <span className="stat-label">
            Ya generado · {pasados.length} {pasados.length === 1 ? 'mes' : 'meses'}
          </span>
        </div>
        <div className="stat">
          <strong className="stat-value stat-value-sm">{clp(proyectado.margin)}</strong>
          <span className="stat-label">Proyectado · {proyectado.eventos} eventos</span>
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>Mes a mes</h2>
        </div>

        <div className="table-wrap">
          <table className="table table-compact">
            <thead>
              <tr>
                <th>Mes</th>
                <th className="num">Eventos</th>
                <th className="num">Ingresos</th>
                <th className="num">Egresos</th>
                <th className="num">Margen</th>
                <th className="hide-sm">Reparto</th>
              </tr>
            </thead>
            <tbody>
              {flujo.map((m) => (
                <tr
                  key={m.key}
                  className={m.key === mes ? 'row-selected' : undefined}
                  onClick={() => setMes(m.key)}
                >
                  <td>
                    <span className="cell-name">{monthLabel(m.key)}</span>
                    <span className="cell-unit">
                      {m.pasado ? 'cerrado' : m.actual ? 'en curso' : 'proyectado'}
                    </span>
                  </td>
                  <td className="num">
                    {m.realizados + m.confirmados}
                    {m.tentativos > 0 && <span className="tentativo"> +{m.tentativos}</span>}
                  </td>
                  <td className="num">
                    {clp(m.income)}
                    {m.incomeTentative > 0 && (
                      <span className="unit tentativo">+{clp(m.incomeTentative)} sin firmar</span>
                    )}
                  </td>
                  <td className="num muted">{clp(m.expenses)}</td>
                  <td className="num">
                    <span className={m.margin >= 0 ? 'saldo saldo-pos' : 'saldo saldo-neg'}>
                      {clp(m.margin)}
                    </span>
                    <span className="unit">{Math.round(m.marginPct)}%</span>
                  </td>
                  <td className="hide-sm">
                    <span className="bar">
                      <span
                        className="bar-cost"
                        style={{ width: (m.expenses / tope) * 100 + '%' }}
                      />
                      <span
                        className="bar-margin"
                        style={{ width: (Math.max(m.margin, 0) / tope) * 100 + '%' }}
                      />
                      {m.incomeTentative > 0 && (
                        <span
                          className="bar-tentative"
                          style={{ width: (m.incomeTentative / tope) * 100 + '%' }}
                        />
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="cal-legend">
          <span className="legend-dot legend-cost" /> Egresos
          <span className="legend-dot legend-margin" /> Margen
          <span className="legend-dot legend-tent" /> Sin firmar
        </p>
      </section>

      <section className="section">
        <div className="section-head section-head-row">
          <h2>Eventos de {monthLabel(mes)}</h2>
          <span className="report-hint">Tocá un mes de la tabla para cambiar</span>
        </div>

        {delMes.length === 0 ? (
          <p className="empty">No hay eventos ese mes.</p>
        ) : (
          <div className="table-wrap">
            <table className="table table-compact">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th className="num">Ingreso</th>
                  <th className="num hide-sm">Insumos</th>
                  <th className="num hide-sm">Gastos</th>
                  <th className="num hide-sm">Roturas</th>
                  <th className="num">Margen</th>
                </tr>
              </thead>
              <tbody>
                {delMes.map((e) => {
                  const m = eventMoney(e, itemById, setupById, reportByEvent[e.id])
                  const tentativo = !isPast(e, today) && e.status === 'tentative'
                  return (
                    <tr key={e.id} className={tentativo ? 'me-off' : undefined}>
                      <td>
                        <span className="cell-name">
                          {e.clientName}
                          {e.demo && <span className="tag-demo">prueba</span>}
                        </span>
                        <span className="cell-unit">
                          {formatDate(e.date)} · {e.guestCount} personas
                          {tentativo && ' · sin firmar'}
                        </span>
                      </td>
                      <td className="num">{clp(m.income)}</td>
                      <td className="num muted hide-sm">{clp(m.supplies)}</td>
                      <td className="num muted hide-sm">{m.extra ? clp(m.extra) : '—'}</td>
                      <td className="num hide-sm">
                        {m.breakage ? <span className="broken">{clp(m.breakage)}</span> : '—'}
                      </td>
                      <td className="num">
                        <span className={m.margin >= 0 ? 'saldo saldo-pos' : 'saldo saldo-neg'}>
                          {clp(m.margin)}
                        </span>
                        <span className="unit">{Math.round(m.marginPct)}%</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="reset-line">
        Los egresos son los insumos que se consumen, los gastos propios del evento y lo que
        se rompe. El menaje no cuenta: vuelve a bodega.
      </p>
    </>
  )
}
