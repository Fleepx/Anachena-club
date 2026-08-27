import { company, VAT_RATE } from '../data/config.js'
import { loadLogo, loadJsPDF, TINTA, ACENTO, ROJO, FONDO, M, AN, money, dmy } from './pdfBase.js'

const Y_BLOQUES = 184
const LOGO_W = 34
const LOGO_H = 27.7

const COL = [
  { t: 'SERVICIO', w: 78, a: 'left' },
  { t: 'CANTIDAD', w: 28, a: 'right' },
  { t: 'VALOR UNIT.', w: 34, a: 'right' },
  { t: 'TOTAL', w: 45.9, a: 'right' }
]

const VALIDEZ_DIAS = 15

const sumarDias = (iso, dias) => {
  const [y, m, d] = iso.split('-').map(Number)
  const f = new Date(y, m - 1, d + dias)
  return (
    f.getFullYear() +
    '-' +
    String(f.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(f.getDate()).padStart(2, '0')
  )
}

export async function generarCotizacion({ event, setupById, docNumber, logo, issuedAt }) {
  const JsPDF = await loadJsPDF()
  const logoData = logo !== undefined ? logo : await loadLogo()
  const doc = new JsPDF({ unit: 'mm', format: 'letter' })

  const tinta = () => {
    doc.setTextColor(...TINTA)
    doc.setDrawColor(...TINTA)
  }
  tinta()

  const xCol = []
  COL.reduce((acc, c, i) => {
    xCol[i] = acc
    return acc + c.w
  }, M)
  const px = (i) => (COL[i].a === 'right' ? xCol[i] + COL[i].w - 2 : xCol[i] + 2)

  const emitida = issuedAt ?? event.date
  const vence = sumarDias(emitida, VALIDEZ_DIAS)
  const setup = setupById?.[event.setupId]

  const xDatos = logoData ? M + LOGO_W + 8 : M
  const bw = 58
  const bx = M + AN - bw

  if (logoData) {
    doc.addImage(logoData, 'PNG', M, 14, LOGO_W, LOGO_H, undefined, 'SLOW')
  } else {
    doc.setFont('helvetica', 'bold').setFontSize(15).setTextColor(...ACENTO)
    doc.text(company.name, M, 22)
    tinta()
  }

  tinta()
  const anchoDatos = bx - xDatos - 4
  const linea = (txt, yy, size, estilo) => {
    doc.setFont('helvetica', estilo)
    let s = size
    doc.setFontSize(s)
    while (doc.getTextWidth(txt) > anchoDatos && s > 5.5) {
      s -= 0.2
      doc.setFontSize(s)
    }
    doc.text(txt, xDatos, yy)
  }

  linea(company.name, 20, 8.4, 'bold')
  linea(company.line, 25, 7.6, 'normal')
  linea(`${company.address}  ·  ${company.phone}`, 29.5, 7.6, 'normal')
  linea(`${company.email}  ·  ${company.web}`, 34, 7.6, 'normal')

  doc.setDrawColor(...ROJO).setLineWidth(0.5)
  doc.rect(bx, 15, bw, 20)
  doc.setTextColor(...ROJO).setFont('helvetica', 'bold').setFontSize(8)
  doc.text(company.rut, bx + bw / 2, 21, { align: 'center' })
  doc.setFontSize(12)
  doc.text('COTIZACION', bx + bw / 2, 27.5, { align: 'center' })
  doc.setFontSize(10)
  doc.text('N ' + docNumber, bx + bw / 2, 33, { align: 'center' })

  tinta()
  doc.setLineWidth(0.3)
  doc.rect(bx, 37, bw, 7)
  doc.setFont('helvetica', 'normal').setFontSize(8)
  doc.text('Fecha de emision: ' + dmy(emitida), bx + bw / 2, 41.6, { align: 'center' })

  let y = 50
  doc.setLineWidth(0.3).rect(M, y, AN, 20)
  doc.setFontSize(8.2)

  const campo = (label, valor, cx, cy, wLabel) => {
    doc.setFont('helvetica', 'bold').text(label, cx, cy)
    doc.setFont('helvetica', 'normal').text(String(valor || '-'), cx + wLabel, cy)
  }

  campo('Senor(es)', event.clientName, M + 3, y + 6, 22)
  campo('Evento', setup ? setup.name : '-', M + 100, y + 6, 22)
  campo('Contacto', event.contactName, M + 3, y + 12, 22)
  campo('Fecha evento', dmy(event.date) + '  ' + (event.startTime || ''), M + 100, y + 12, 22)
  campo('Telefono', event.contactPhone, M + 3, y + 18, 22)
  campo('Email', event.contactEmail, M + 100, y + 18, 22)

  y += 26

  const encabezado = () => {
    doc.setFillColor(...FONDO).setLineWidth(0.3)
    COL.forEach((c, i) => doc.rect(xCol[i], y, c.w, 7, 'FD'))
    doc.setFont('helvetica', 'bold').setFontSize(7.8)
    COL.forEach((c, i) => doc.text(c.t, px(i), y + 4.6, { align: c.a }))
    y += 7
  }

  encabezado()

  const neto = event.guestCount * event.pricePerGuest
  const detalle =
    'Arriendo de salon y servicio de banqueteria' +
    (setup ? ' — montaje ' + setup.name.toLowerCase() : '')

  doc.setFont('helvetica', 'normal').setFontSize(8)
  const nombre = doc.splitTextToSize(detalle, COL[0].w - 4)
  const alto = Math.max(7, 3.4 * nombre.length + 3.6)

  COL.forEach((c, i) => doc.rect(xCol[i], y, c.w, alto))
  doc.text(nombre, px(0), y + 4.8, { align: COL[0].a })
  doc.text(event.guestCount + ' personas', px(1), y + 4.8, { align: COL[1].a })
  doc.text(money(event.pricePerGuest), px(2), y + 4.8, { align: COL[2].a })
  doc.text(money(neto), px(3), y + 4.8, { align: COL[3].a })
  y += alto

  if (y < Y_BLOQUES) doc.setLineWidth(0.3).rect(M, y, AN, Y_BLOQUES - y)

  const iva = Math.round(neto * VAT_RATE)
  const total = neto + iva

  const filas = [
    ['Moneda', 'PESO CHILENO', false],
    ['Monto Neto', money(neto), false],
    ['Monto Exento', money(0), false],
    ['IVA 19%', money(iva), false],
    ['Total', money(total), true]
  ]

  const yb = Y_BLOQUES + 5
  const hBloque = 7 + filas.length * 6.6
  const wObs = 110
  const wTot = AN - wObs

  doc.setLineWidth(0.3)
  doc.setFillColor(...FONDO)
  doc.rect(M, yb, wObs, 7, 'FD')
  doc.setFont('helvetica', 'bold').setFontSize(7.8)
  doc.text('OBSERVACIONES', M + 2, yb + 4.6)
  doc.rect(M, yb + 7, wObs, hBloque - 7)

  const obs = [
    'EVENTO: ' + (setup ? setup.name.toUpperCase() : '') + ' PARA ' + event.guestCount + ' PERSONAS',
    'FECHA: ' + dmy(event.date) + (event.startTime ? '  DESDE LAS ' + event.startTime : ''),
    '',
    'VALIDEZ DE PRECIO ' + VALIDEZ_DIAS + ' DIAS (HASTA EL ' + dmy(vence) + ')',
    '',
    'VALOR POR PERSONA: ' + money(event.pricePerGuest)
  ]

  doc.setFont('helvetica', 'normal').setFontSize(7.6)
  obs.forEach((l, i) => {
    if (l) doc.text(l, M + 2, yb + 12 + i * 3.8)
  })

  const xt = M + wObs
  doc.setFillColor(...FONDO)
  doc.rect(xt, yb, wTot, 7, 'FD')
  doc.setFont('helvetica', 'bold').setFontSize(7.8)
  doc.text('RESUMEN', xt + 2, yb + 4.6)

  let yt = yb + 7
  filas.forEach(([label, valor, fuerte]) => {
    doc.rect(xt, yt, wTot, 6.6)
    doc.setFont('helvetica', fuerte ? 'bold' : 'normal').setFontSize(fuerte ? 9 : 8)
    doc.text(label, xt + 2, yt + 4.5)
    doc.text(valor, xt + wTot - 2, yt + 4.5, { align: 'right' })
    yt += 6.6
  })

  doc.setFont('helvetica', 'normal').setFontSize(6.8)
  doc.text(
    'Documento sujeto a disponibilidad de fecha. La reserva se confirma con el abono acordado.',
    M,
    yb + hBloque + 6
  )
  doc.text(company.web, M + AN, yb + hBloque + 6, { align: 'right' })

  const slug = event.clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  return { doc, filename: 'cotizacion-' + docNumber + '-' + slug + '.pdf', neto, iva, total, vence }
}

export async function descargarCotizacion(params) {
  const { doc, filename, total, vence } = await generarCotizacion(params)
  doc.save(filename)
  return { filename, total, vence }
}
