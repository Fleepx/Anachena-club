export const warehouses = [
  {
    id: 'casa',
    letter: 'A',
    name: 'Bodega de la casa',
    subtitle: 'Dentro',
    desc: 'La bodega principal, dentro de la casa'
  },
  {
    id: 'exterior',
    letter: 'B',
    name: 'Bodega exterior',
    subtitle: 'Fuera',
    desc: 'La bodega de afuera'
  },
  {
    id: 'insumos',
    letter: 'C',
    name: 'Bodega de insumos',
    subtitle: 'Comida y bebida',
    desc: 'Lo que se consume: comida, bebida y desechables'
  }
]

export const warehouseById = Object.fromEntries(warehouses.map((w) => [w.id, w]))

export const WAREHOUSE_BY_CATEGORY = {
  tableware: 'casa',
  glassware: 'casa',
  cutlery: 'casa',
  linen: 'casa',
  equipment: 'casa',
  seating: 'exterior',

  meat: 'insumos',
  produce: 'insumos',
  dry: 'insumos',
  dairy: 'insumos',
  drinks: 'insumos',
  disposable: 'insumos'
}
