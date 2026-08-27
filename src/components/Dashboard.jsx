import { useState } from 'react'
import EventForm from './EventForm.jsx'
import Collapse from './Collapse.jsx'
import { descargarCotizacion } from '../lib/cotizacion.js'
import { useInventory } from '../store/store.jsx'
import {
  shortagesByEvent,
  belowMinimum,
  clp,
  formatDate,
  daysUntil,
  isPast
} from '../lib/inventory.js'

export default function Dashboard({ onGoTo }) {
  const { items, itemById, setupById, reportByEvent, today, events: allEvents, canEdit } =
    useInventory()
  const [adding, setAdding] = useState(false)

  const events = allEvents.filter((e) => !isPast(e, today))
  const toClose = allEvents.filter((e) => isPast(e, today) && !reportByEvent[e.id])

  const report = shortagesByEvent(events, itemById, setupById)
  const lowStock = belowMinimum(items)
  const totalGuests = events.reduce((s, e) => s + e.guestCount, 0)
  const totalPurchase = report.reduce((s, r) => s + r.purchaseCost, 0)

  return (
    <>
      {toClose.length > 0 && (
        <button className="alert" onClick={() => onGoTo?.('breakage')}>
          <strong>
            {toClose.length}{' '}
            {toClose.length === 1 ? 'evento pasó y no tiene' : 'eventos pasaron y no tienen'} parte
            de roturas
          </strong>
          <span>
            {toClose.map((e) => e.clientName).join(' · ')} — hasta que se cierre, el stock que ves
            no es el real
          </span>
        </button>
      )}

      <section className="stats">
        <Stat value={events.length} label="Eventos proximos" />
        <Stat value={totalGuests} label="Personas agendadas" />
        <Stat value={lowStock.length} label="Insumos bajo mínimo" tone={lowStock.length ? 'warn' : 'ok'} />
        <Stat value={clp(totalPurchase)} label="Compra estimada" tone="warn" small />
      </section>

      <section className="section">
        <div className="section-head section-head-row">
          <h2>Próximos eventos</h2>
          {canEdit && !adding && (
            <button className="btn btn-primary" onClick={() => setAdding(true)}>
              Nuevo evento
            </button>
          )}
        </div>

        {adding && (
          <div className="add-panel">
            <EventForm onDone={() => setAdding(false)} />
          </div>
        )}
        <div className="event-list">
          {report.map((r, idx) => (
            <EventCard
              key={r.event.id}
              report={r}
              today={today}
              setupById={setupById}
              docNumber={500 + idx}
            />
          ))}
        </div>
      </section>
    </>
  )
}

function Stat({ value, label, tone, small }) {
  return (
    <div className={'stat' + (tone ? ' stat-' + tone : '')}>
      <strong className={small ? 'stat-value stat-value-sm' : 'stat-value'}>{value}</strong>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function EventCard({ report, today, setupById, docNumber }) {
  const { canEdit } = useInventory()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const { event, lines, purchaseCost } = report
  const [ty, tm, td] = today.split('-').map(Number)
  const days = daysUntil(event.date, new Date(ty, tm - 1, td))
  const setup = setupById[event.setupId]

  return (
    <article className={open ? 'event event-open' : 'event'}>
      <button className="event-head" onClick={() => setOpen(!open)}>
        <span className={days === 0 ? 'event-when event-when-now' : 'event-when'}>
          {days === 0 ? (
            <strong className="when-word">Hoy</strong>
          ) : days === 1 ? (
            <strong className="when-word">Mañana</strong>
          ) : (
            <>
              <strong>{days}</strong>
              <span>días</span>
            </>
          )}
        </span>

        <span className="event-main">
          <span className="event-title">
            {event.clientName}
            {event.demo && <span className="tag-demo">prueba</span>}
            <span className="event-kind"> · {setup?.name}</span>
          </span>
          <span className="event-meta">
            {formatDate(event.date)} · {event.startTime} hrs · {event.guestCount} personas
          </span>
        </span>

        <span className="event-flags">
          {lines.length > 0 ? (
            <span className="badge badge-danger">Faltan {lines.length}</span>
          ) : (
            <span className="badge badge-ok">Listo</span>
          )}
          <span className={open ? 'chev chev-open' : 'chev'}>&#8250;</span>
        </span>
      </button>

      <Collapse open={open}>
        <div className="event-body">
          <dl className="event-details">
            <div>
              <dt>Contacto</dt>
              <dd>
                {event.contactName || 'Sin registrar'}
                {event.contactPhone && ' · ' + event.contactPhone}
              </dd>
            </div>
            <div><dt>Montaje</dt><dd>{setup?.name ?? '—'}</dd></div>
            <div><dt>Menú</dt><dd>{setupById[event.menuId]?.name ?? 'Sin menú'}</dd></div>
            <div>
              <dt>Cóctel</dt>
              <dd>{setupById[event.cocktailId]?.name ?? 'Sin cóctel'}</dd>
            </div>
            <div><dt>Estado</dt><dd>{event.status === 'confirmed' ? 'Confirmado' : 'Por confirmar'}</dd></div>
            <div className="wide"><dt>Notas</dt><dd>{event.notes}</dd></div>
          </dl>

          {canEdit && (
          <QuoteBar
            event={event}
            setupById={setupById}
            today={today}
            docNumber={docNumber}
            busy={busy}
            setBusy={setBusy}
            error={error}
            setError={setError}
          />
          )}

          {lines.length === 0 ? (
            <p className="all-good">Hay stock para todo. No falta comprar nada.</p>
          ) : (
            <div className="shortage">
              <div className="shortage-head">
                <h3>Falta comprar</h3>
                <span className="shortage-cost">{clp(purchaseCost)}</span>
              </div>
              <ul className="shortage-list">
                {lines.map((l) => (
                  <li key={l.item.id}>
                    <span className="sh-name">{l.item.name}</span>
                    <span className="sh-detail">
                      necesita {l.required} · hay {l.available} {l.item.unit}
                    </span>
                    <span className="sh-missing">{l.missing}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Collapse>
    </article>
  )
}

function QuoteBar({ event, setupById, today, docNumber, busy, setBusy, error, setError }) {
  const total = (event.pricePerGuest ?? 0) * event.guestCount
  const setup = setupById[event.setupId]

  const emitir = async () => {
    setBusy(true)
    setError(null)
    try {
      const { vence } = await descargarCotizacion({
        event,
        setupById,
        docNumber,
        issuedAt: today
      })
      return vence
    } catch {
      setError('No se pudo generar la cotización.')
    } finally {
      setBusy(false)
    }
  }

  const mailto = () => {
    const asunto = `Cotización ${setup?.name ?? 'evento'} — ${formatDate(event.date)}`
    const cuerpo = [
      `Estimado/a ${event.contactName || event.clientName}:`,
      '',
      `Adjunto la cotización N° ${docNumber} por el evento del ${formatDate(event.date)}`,
      `para ${event.guestCount} personas.`,
      '',
      `Valor por persona: ${clp(event.pricePerGuest ?? 0)}`,
      `Total neto: ${clp(total)}`,
      '',
      'Quedamos atentos.',
      '',
      'Club de Eventos Anachena'
    ].join('\n')

    return `mailto:${event.contactEmail ?? ''}?subject=${encodeURIComponent(
      asunto
    )}&body=${encodeURIComponent(cuerpo)}`
  }

  if (!event.pricePerGuest) {
    return (
      <p className="quote-empty">
        Este evento no tiene valor cargado, así que no se puede cotizar.
      </p>
    )
  }

  return (
    <div className="quote-bar">
      <div className="quote-sum">
        <span>
          {event.guestCount} personas × {clp(event.pricePerGuest)}
        </span>
        <strong>{clp(total)}</strong>
      </div>
      <div className="quote-actions">
        {event.contactEmail && (
          <a className="btn btn-ghost" href={mailto()}>
            Preparar correo
          </a>
        )}
        <button className="btn btn-primary" disabled={busy} onClick={emitir}>
          {busy ? 'Generando...' : 'Generar cotización'}
        </button>
      </div>
      {error && <p className="error-line">{error}</p>}
    </div>
  )
}
