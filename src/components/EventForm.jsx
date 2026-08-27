import { useState } from 'react'
import { useInventory } from '../store/store.jsx'
import { HALL_CAPACITY } from '../data/config.js'
import { formatDate, isPast, clp } from '../lib/inventory.js'

export default function EventForm({ onDone }) {
  const { events, setups: templates, createEvent, today } = useInventory()

  const setups = templates.filter((t) => t.kind === 'setup')
  const menus = templates.filter((t) => t.kind === 'menu')
  const cocktails = templates.filter((t) => t.kind === 'cocktail')

  const [clientName, setClientName] = useState('')
  const [typeName, setTypeName] = useState(setups[0].name)
  const [basedOn, setBasedOn] = useState(setups[0].id)
  const [menuId, setMenuId] = useState(menus[0]?.id ?? '')
  const [cocktailId, setCocktailId] = useState('')
  const [date, setDate] = useState(today)
  const [startTime, setStartTime] = useState('20:00')
  const [guestCount, setGuestCount] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [price, setPrice] = useState('')
  const [priceMode, setPriceMode] = useState('perGuest')
  const [eventCosts, setEventCosts] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('confirmed')

  const guests = Math.floor(Number(guestCount) || 0)

  const priceValue = Math.max(0, Math.round(Number(price) || 0))
  const perGuest =
    priceMode === 'total' && guests > 0 ? Math.round(priceValue / guests) : priceValue
  const totalEvento = perGuest * guests

  const typed = typeName.trim()
  const match = setups.find((s) => s.name.toLowerCase() === typed.toLowerCase())
  const isNewType = typed.length > 0 && !match

  const sameDay = events.filter((e) => e.date === date)
  const overCapacity = guests > HALL_CAPACITY
  const inThePast = date && date < today

  const valid = clientName.trim().length > 0 && date && guests > 0 && typed.length > 0

  const submit = () => {
    if (!valid) return
    createEvent({
      clientName,
      setupId: match ? match.id : basedOn,
      newTypeName: isNewType ? typed : null,
      basedOn,
      menuId,
      cocktailId,
      date,
      startTime,
      guestCount: guests,
      contactName,
      contactPhone,
      contactEmail,
      pricePerGuest: perGuest,
      eventCosts,
      notes,
      status
    })
    onDone?.()
  }

  return (
    <div className="form-panel">
      <div className="form-head">
        <div>
          <h3>Nuevo evento</h3>
          <p>{date ? formatDate(date) : 'Elegí una fecha'}</p>
        </div>
      </div>

      <div className="form-grid">
        <label>
          <span>Cliente</span>
          <input
            type="text"
            value={clientName}
            placeholder="Ej: Familia Soto"
            onChange={(e) => setClientName(e.target.value)}
          />
        </label>

        <label>
          <span>Contacto</span>
          <input
            type="text"
            value={contactName}
            placeholder="Nombre"
            onChange={(e) => setContactName(e.target.value)}
          />
        </label>

        <label>
          <span>Teléfono</span>
          <input
            type="tel"
            value={contactPhone}
            placeholder="+56 9 ..."
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </label>

        <label>
          <span>Tipo de evento</span>
          <input
            type="text"
            list="tipos-de-evento"
            value={typeName}
            placeholder="Boda, bautizo, aniversario..."
            onChange={(e) => setTypeName(e.target.value)}
          />
          <datalist id="tipos-de-evento">
            {setups.map((s) => (
              <option key={s.id} value={s.name} />
            ))}
          </datalist>
        </label>

        <label>
          <span>Fecha</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>

        <label>
          <span>Hora</span>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </label>

        <label>
          <span>Personas</span>
          <input
            type="number"
            min="1"
            value={guestCount}
            placeholder="0"
            onChange={(e) => setGuestCount(e.target.value)}
          />
        </label>

        <label>
          <span>Estado</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="confirmed">Confirmado</option>
            <option value="tentative">Por confirmar</option>
          </select>
        </label>

        {isNewType && (
          <label>
            <span>Copia el montaje de</span>
            <select value={basedOn} onChange={(e) => setBasedOn(e.target.value)}>
              {setups.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}

        <label>
          <span>Menú</span>
          <select value={menuId} onChange={(e) => setMenuId(e.target.value)}>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Cóctel</span>
          <select value={cocktailId} onChange={(e) => setCocktailId(e.target.value)}>
            <option value="">Sin cóctel</option>
            {cocktails.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Correo</span>
          <input
            type="email"
            value={contactEmail}
            placeholder="cliente@correo.cl"
            onChange={(e) => setContactEmail(e.target.value)}
          />
        </label>

        <label>
          <span>Valor</span>
          <input
            type="number"
            min="0"
            value={price}
            placeholder="0"
            onChange={(e) => setPrice(e.target.value)}
          />
        </label>

        <label>
          <span>El valor es</span>
          <select value={priceMode} onChange={(e) => setPriceMode(e.target.value)}>
            <option value="perGuest">por persona</option>
            <option value="total">total del evento</option>
          </select>
        </label>

        <label>
          <span>Gastos del evento</span>
          <input
            type="number"
            min="0"
            value={eventCosts}
            placeholder="Personal, música, decoración"
            onChange={(e) => setEventCosts(e.target.value)}
          />
        </label>

        <label className="wide">
          <span>Notas</span>
          <input
            type="text"
            value={notes}
            placeholder="Detalles del montaje, pedidos especiales"
            onChange={(e) => setNotes(e.target.value)}
          />
        </label>
      </div>

      {(sameDay.length > 0 || overCapacity || inThePast || isNewType) && (
        <div className="form-warnings">
          {isNewType && (
            <p className="warn warn-info">
              «{typed}» es un tipo nuevo. Va a arrancar con el mismo montaje que{' '}
              {setups.find((s) => s.id === basedOn)?.name} y después se ajusta.
            </p>
          )}
          {sameDay.length > 0 && (
            <p className="warn warn-strong">
              Ya hay {sameDay.length === 1 ? 'un evento' : sameDay.length + ' eventos'} ese
              día: {sameDay.map((e) => e.clientName).join(' · ')}. El salón es uno solo.
            </p>
          )}
          {overCapacity && (
            <p className="warn">
              {guests} personas supera la capacidad del salón ({HALL_CAPACITY}).
            </p>
          )}
          {inThePast && (
            <p className="warn">
              La fecha ya pasó. Va a entrar directo como evento realizado, pendiente de
              parte de roturas.
            </p>
          )}
        </div>
      )}

      <div className="form-foot">
        <div className="form-total">
          <span>
            {typed || 'Sin tipo'}
            {menus.find((m) => m.id === menuId) &&
              ' · ' + menus.find((m) => m.id === menuId).name}
            {cocktailId && ' + ' + cocktails.find((c) => c.id === cocktailId)?.name}
            {guests > 0 && ' · ' + guests + ' personas'}
            {perGuest > 0 && guests > 0 && ' · ' + clp(perGuest) + ' c/u'}
          </span>
          <strong>{totalEvento > 0 ? clp(totalEvento) : '—'}</strong>
        </div>
        <div className="form-actions">
          <button className="btn btn-ghost" onClick={() => onDone?.()}>
            Cancelar
          </button>
          <button className="btn btn-primary" disabled={!valid} onClick={submit}>
            Agendar evento
          </button>
        </div>
      </div>
    </div>
  )
}
