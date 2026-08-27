import { useState } from 'react'
import { monthGrid, WEEKDAYS, monthLabel, isPast } from '../lib/inventory.js'
import { useInventory } from '../store/store.jsx'
import Collapse from './Collapse.jsx'

export default function MonthCalendar({ month, events, included, onToggle, today }) {
  const { setupById } = useInventory()
  const [open, setOpen] = useState(false)
  const cells = monthGrid(month)

  const byDay = {}
  for (const e of events) (byDay[e.date] ??= []).push(e)

  const activos = events.filter((e) => !isPast(e, today)).length

  return (
    <div className={open ? 'calendar calendar-open' : 'calendar'}>
      <button className="cal-toggle" onClick={() => setOpen(!open)}>
        <span className="cal-toggle-title">Calendario de {monthLabel(month)}</span>
        <span className="cal-toggle-meta">
          {events.length === 0
            ? 'sin eventos'
            : events.length + (events.length === 1 ? ' evento' : ' eventos') +
              (activos !== events.length ? ' · ' + activos + ' por delante' : '')}
        </span>
        <span className={open ? 'chev chev-open' : 'chev'}>&#8250;</span>
      </button>

      <Collapse open={open}>
        <div className="cal-body">
      <div className="cal-grid cal-head">
        {WEEKDAYS.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="cal-cell cal-empty" />

          const dayEvents = byDay[cell.iso] ?? []
          const isToday = cell.iso === today

          return (
            <div key={i} className={'cal-cell' + (isToday ? ' cal-today' : '')}>
              <span className="cal-day">{cell.day}</span>

              {dayEvents.map((e) => {
                const done = isPast(e, today)
                const off = done || !included.has(e.id)
                const setup = setupById[e.setupId]

                return (
                  <button
                    key={e.id}
                    className={
                      'cal-event' + (off ? ' cal-event-off' : '') + (e.demo ? ' cal-event-demo' : '')
                    }
                    disabled={done}
                    onClick={() => onToggle(e.id)}
                    title={
                      (e.demo ? '[prueba] ' : '') +
                      (done
                        ? e.clientName + ' — ya realizado'
                        : e.clientName +
                          ' · ' +
                          (setup?.name ?? '') +
                          ' · ' +
                          e.guestCount +
                          ' personas')
                    }
                  >
                    <span className="cal-event-name">{e.clientName}</span>
                    <span className="cal-event-guests">{e.guestCount}p</span>
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

          <p className="cal-legend">
            <span className="legend-dot legend-on" /> En el cálculo
            <span className="legend-dot legend-off" /> Fuera
            <span className="legend-sep">·</span>
            Tocá un evento para incluirlo o sacarlo.
          </p>
        </div>
      </Collapse>
    </div>
  )
}
