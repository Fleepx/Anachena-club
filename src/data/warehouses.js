export const warehouses = [
  {
    id: 'interior',
    letter: 'A',
    name: 'Interior',
    subtitle: 'Interior',
    desc: 'La bodega de adentro de la casa'
  },
  {
    id: 'exterior',
    letter: 'B',
    name: 'Exterior',
    subtitle: 'Exterior',
    desc: 'La bodega de afuera'
  },
  {
    id: 'insumos',
    letter: 'C',
    name: 'Insumos',
    subtitle: 'Comida y bebida',
    desc: 'Lo que se consume: comida, bebida y desechables'
  }
]

export const warehouseById = Object.fromEntries(warehouses.map((w) => [w.id, w]))

export const WAREHOUSE_BY_CATEGORY = {
  tableware: 'interior',
  glassware: 'interior',
  cutlery: 'interior',
  linen: 'interior',
  equipment: 'interior',
  seating: 'exterior',

  meat: 'insumos',
  produce: 'insumos',
  dry: 'insumos',
  dairy: 'insumos',
  drinks: 'insumos',
  disposable: 'insumos'
}
