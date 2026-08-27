export const warehouses = [
  {
    id: 'dentro',
    letter: 'D',
    name: 'Dentro',
    subtitle: 'Bodega de la casa',
    desc: 'La bodega principal, dentro de la casa'
  },
  {
    id: 'fuera',
    letter: 'F',
    name: 'Fuera',
    subtitle: 'Bodega exterior',
    desc: 'La bodega de afuera'
  }
]

export const warehouseById = Object.fromEntries(warehouses.map((w) => [w.id, w]))

export const WAREHOUSE_BY_CATEGORY = {
  glassware: 'dentro',
  equipment: 'dentro',
  linen: 'dentro',
  tableware: 'dentro',
  cutlery: 'dentro',
  seating: 'fuera',

  drinks: 'dentro',
  meat: 'dentro',
  produce: 'dentro',
  dry: 'dentro',
  dairy: 'dentro',
  disposable: 'dentro'
}
