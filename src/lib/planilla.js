import { CATEGORIES } from '../data/items.js'
import { warehouses, WAREHOUSE_BY_CATEGORY } from '../data/warehouses.js'

const SEP = ';'

const BOM = String.fromCharCode(0xfeff)

const COLUMNAS = {
  asset: ['Nombre', 'Categoria', 'Bodega', 'Sector', 'Unidad', 'Cantidad', 'Precio unitario'],
  consumable: [
    'Nombre',
    'Categoria',
    'Bodega',
    'Sector',
    'Unidad',
    'Cantidad',
    'Precio unitario',
    'Stock minimo',
    'Limpieza %',
    'Coccion %'
  ]
}

const EJEMPLOS = {
  asset: [
    ['Silla Tiffany', 'Mobiliario', 'C', '', 'unidad', '280', '18000'],
    ['Copa de agua', 'Cristaleria', 'A', '', 'unidad', '242', '2900']
  ],
  consumable: [
    ['Lomo vetado', 'Carnes', 'B', 'Camara de frio', 'kg', '45', '12500', '30', '75', '84'],
    ['Vino tinto', 'Bebidas', 'B', 'Cava', 'botella', '96', '5900', '60', '100', '100']
  ]
}

const normalizar = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const escapar = (v) => {
  const s = String(v ?? '')
  return s.includes(SEP) || s.includes('"') || s.includes('\n')
    ? '"' + s.replace(/"/g, '""') + '"'
    : s
}

const letraDe = (id) => warehouses.find((w) => w.id === id)?.letter ?? ''

const filaDeItem = (item, type, labelDe) =>
  type === 'asset'
    ? [
        item.name,
        labelDe(item.category),
        letraDe(item.warehouse),
        item.detail ?? '',
        item.unit,
        item.stockOnHand,
        item.unitCost
      ]
    : [
        item.name,
        labelDe(item.category),
        letraDe(item.warehouse),
        item.detail ?? '',
        item.unit,
        item.stockOnHand,
        item.unitCost,
        item.minStock ?? 0,
        Math.round((item.yieldRate ?? 1) * 100),
        Math.round((item.cookingYield ?? 1) * 100)
      ]

export function generarPlanilla(items, type) {
  const cats = CATEGORIES[type]
  const labelDe = (id) => cats.find((c) => c.id === id)?.label ?? id

  const propios = items.filter((i) => i.type === type)
  const filas = propios.length > 0 ? propios.map((i) => filaDeItem(i, type, labelDe)) : EJEMPLOS[type]

  const lineas = [
    COLUMNAS[type].join(SEP),
    ...filas.map((f) => f.map(escapar).join(SEP)),
    '',
    '# Categorias validas: ' + cats.map((c) => c.label).join(' / '),
    '# Bodegas: ' + warehouses.map((w) => w.letter + ' = ' + w.subtitle).join(' / '),
    '# Si la bodega va vacia se asigna sola segun la categoria.',
    '# El nombre es la llave: si ya existe se actualiza, si no se crea.',
    type === 'consumable'
      ? '# Limpieza y coccion en porcentaje. 100 = no se pierde nada. El arroz gana peso: 280.'
      : '# Las cantidades son las que hay sanas en bodega, sin contar lo roto.'
  ]

  return BOM + lineas.join('\r\n')
}

function partirLinea(linea, sep) {
  const campos = []
  let actual = ''
  let dentroDeComillas = false

  for (let i = 0; i < linea.length; i++) {
    const c = linea[i]
    if (c === '"') {
      if (dentroDeComillas && linea[i + 1] === '"') {
        actual += '"'
        i++
      } else {
        dentroDeComillas = !dentroDeComillas
      }
    } else if (c === sep && !dentroDeComillas) {
      campos.push(actual)
      actual = ''
    } else {
      actual += c
    }
  }
  campos.push(actual)
  return campos.map((c) => c.trim())
}

function aNumero(v) {
  const s = String(v ?? '').trim()
  if (!s) return 0
  const limpio = s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/\.(?=\d{3}\b)/g, '')
  const n = Number(limpio)
  return Number.isFinite(n) ? n : 0
}

export function leerPlanilla(texto, type, itemsActuales) {
  const sinBom = texto.replace(/^\uFEFF/, '')
  const lineas = sinBom.split(/\r?\n/).filter((l) => l.trim() && !l.trim().startsWith('#'))

  if (lineas.length < 2) {
    return { nuevos: [], actualizados: [], errores: [], intactos: [], vacio: true }
  }

  const cabecera = lineas[0]
  const sep = (cabecera.match(/;/g)?.length ?? 0) >= (cabecera.match(/,/g)?.length ?? 0) ? ';' : ','

  const cats = CATEGORIES[type]
  const catDe = (v) => {
    const n = normalizar(v)
    return cats.find((c) => normalizar(c.label) === n || c.id === n)?.id ?? null
  }

  const porNombre = new Map(
    itemsActuales.filter((i) => i.type === type).map((i) => [normalizar(i.name), i])
  )

  const esComida = type === 'consumable'
  const nuevos = []
  const actualizados = []
  const errores = []
  const vistos = new Set()

  lineas.slice(1).forEach((linea, idx) => {
    const fila = idx + 2
    const c = partirLinea(linea, sep)
    const nombre = c[0]

    if (!nombre) {
      errores.push({ fila, motivo: 'sin nombre' })
      return
    }

    const clave = normalizar(nombre)
    if (vistos.has(clave)) {
      errores.push({ fila, nombre, motivo: 'repetido en la planilla' })
      return
    }
    vistos.add(clave)

    const categoria = catDe(c[1])
    if (!categoria) {
      errores.push({
        fila,
        nombre,
        motivo: c[1] ? `categoría "${c[1]}" no existe` : 'sin categoría'
      })
      return
    }

    const bodegaTxt = normalizar(c[2])
    const bodega =
      warehouses.find(
        (w) =>
          normalizar(w.letter) === bodegaTxt ||
          normalizar(w.name) === bodegaTxt ||
          normalizar(w.subtitle) === bodegaTxt ||
          w.id === bodegaTxt
      )?.id ?? WAREHOUSE_BY_CATEGORY[categoria]

    const datos = {
      name: nombre,
      category: categoria,
      warehouse: bodega,
      detail: c[3]?.trim() ?? '',
      unit: c[4]?.trim() || (esComida ? 'kg' : 'unidad'),
      stockOnHand: Math.max(0, esComida ? aNumero(c[5]) : Math.round(aNumero(c[5]))),
      unitCost: Math.max(0, Math.round(aNumero(c[6])))
    }

    if (esComida) {
      datos.minStock = Math.max(0, Math.round(aNumero(c[7])))
      const limpieza = aNumero(c[8])
      const coccion = aNumero(c[9])
      datos.yieldRate = limpieza > 0 ? limpieza / 100 : 1
      datos.cookingYield = coccion > 0 ? coccion / 100 : 1
    }

    const existente = porNombre.get(clave)
    if (existente) {
      actualizados.push({ id: existente.id, antes: existente, datos })
    } else {
      nuevos.push(datos)
    }
  })

  const enPlanilla = new Set([
    ...nuevos.map((n) => normalizar(n.name)),
    ...actualizados.map((a) => normalizar(a.datos.name))
  ])

  const intactos = itemsActuales.filter(
    (i) => i.type === type && !enPlanilla.has(normalizar(i.name))
  )

  return { nuevos, actualizados, errores, intactos, vacio: false }
}
