export const warehouses = [
  {
    id: 'delicada',
    letter: 'A',
    name: 'Bodega A',
    subtitle: 'Delicado',
    desc: 'Cristalería, equipos y todo lo de mayor valor'
  },
  {
    id: 'abastecimiento',
    letter: 'B',
    name: 'Bodega B',
    subtitle: 'Alcohol y abastecimiento',
    desc: 'Vinos, bebidas e insumos de cocina'
  },
  {
    id: 'loza',
    letter: 'C',
    name: 'Bodega C',
    subtitle: 'Loza',
    desc: 'Platos, tazas, cubertería y mobiliario'
  }
]

export const warehouseById = Object.fromEntries(warehouses.map((w) => [w.id, w]))

export const WAREHOUSE_BY_CATEGORY = {
  glassware: 'delicada',
  equipment: 'delicada',
  linen: 'delicada',

  drinks: 'abastecimiento',
  meat: 'abastecimiento',
  produce: 'abastecimiento',
  dry: 'abastecimiento',
  dairy: 'abastecimiento',
  disposable: 'abastecimiento',

  tableware: 'loza',
  cutlery: 'loza',
  seating: 'loza'
}
