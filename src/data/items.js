export const CATEGORIES = {
  asset: [
    { id: 'seating', label: 'Mobiliario' },
    { id: 'linen', label: 'Mantelería' },
    { id: 'tableware', label: 'Vajilla' },
    { id: 'glassware', label: 'Cristalería' },
    { id: 'cutlery', label: 'Cubertería' },
    { id: 'equipment', label: 'Equipamiento' }
  ],
  consumable: [
    { id: 'meat', label: 'Carnes' },
    { id: 'produce', label: 'Verduras y frutas' },
    { id: 'dry', label: 'Abarrotes' },
    { id: 'dairy', label: 'Lácteos' },
    { id: 'drinks', label: 'Bebidas' },
    { id: 'disposable', label: 'Desechables' }
  ]
}

export const items = [


  { id: 'plate-28', name: 'Plato 28 cm', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 210, exterior: 139 }, stockOnHand: 349, stockOut: 0, stockBroken: 0, unitCost: 5500, warehouse: 'interior', detail: '' },
  { id: 'plate-26', name: 'Plato 26 cm', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 205, exterior: 0 }, stockOnHand: 205, stockOut: 0, stockBroken: 0, unitCost: 4800, warehouse: 'interior', detail: '' },
  { id: 'plate-20', name: 'Plato 20 cm', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 210, exterior: 133 }, stockOnHand: 343, stockOut: 0, stockBroken: 0, unitCost: 3900, warehouse: 'interior', detail: '' },
  { id: 'plate-bread', name: 'Plato de pan', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 150, exterior: 19 }, stockOnHand: 169, stockOut: 0, stockBroken: 0, unitCost: 3200, warehouse: 'interior', detail: '' },
  { id: 'plate-coffee', name: 'Plato de café', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 150, exterior: 24 }, stockOnHand: 174, stockOut: 0, stockBroken: 0, unitCost: 3200, warehouse: 'interior', detail: '' },
  { id: 'plate-consomme', name: 'Plato consomé', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 56, exterior: 0 }, stockOnHand: 56, stockOut: 0, stockBroken: 0, unitCost: 4800, warehouse: 'interior', detail: '' },
  { id: 'plate-dessert', name: 'Postre cuadrado', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 41, exterior: 0 }, stockOnHand: 41, stockOut: 0, stockBroken: 0, unitCost: 3900, warehouse: 'interior', detail: '' },
  { id: 'plate-dessert-angled', name: 'Postre cuadrado ladeado', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 44, exterior: 0 }, stockOnHand: 44, stockOut: 0, stockBroken: 0, unitCost: 3900, warehouse: 'interior', detail: '' },
  { id: 'dessert-ceramic', name: 'Postre cerámica normal', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 75, exterior: 0 }, stockOnHand: 75, stockOut: 0, stockBroken: 0, unitCost: 3500, warehouse: 'interior', detail: '' },
  { id: 'dessert-ceramic-small', name: 'Postre cerámica chico', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 17, exterior: 0 }, stockOnHand: 17, stockOut: 0, stockBroken: 0, unitCost: 3000, warehouse: 'interior', detail: '' },
  { id: 'dessert-glass', name: 'Postre vidrio', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 25, exterior: 0 }, stockOnHand: 25, stockOut: 0, stockBroken: 0, unitCost: 3500, warehouse: 'interior', detail: '' },
  { id: 'dessert-glass-square', name: 'Postre vidrio cuadrado', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 44, exterior: 0 }, stockOnHand: 44, stockOut: 0, stockBroken: 0, unitCost: 3500, warehouse: 'interior', detail: '' },
  { id: 'dessert-glass-cup', name: 'Postre vidrio copa', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 12, exterior: 0 }, stockOnHand: 12, stockOut: 0, stockBroken: 0, unitCost: 3800, warehouse: 'interior', detail: '' },
  { id: 'brulee-large', name: 'Quembrule grande', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 1, exterior: 0 }, stockOnHand: 1, stockOut: 0, stockBroken: 0, unitCost: 4000, warehouse: 'interior', detail: '' },
  { id: 'brulee-medium', name: 'Quembrule mediano', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 285, exterior: 0 }, stockOnHand: 285, stockOut: 0, stockBroken: 0, unitCost: 3500, warehouse: 'interior', detail: '' },
  { id: 'brulee-small', name: 'Quembrule chico', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 99, exterior: 0 }, stockOnHand: 99, stockOut: 0, stockBroken: 0, unitCost: 3000, warehouse: 'interior', detail: '' },
  { id: 'cup-coffee', name: 'Taza de café', type: 'asset', category: 'tableware', unit: 'unidad', stock: { interior: 132, exterior: 0 }, stockOnHand: 132, stockOut: 0, stockBroken: 0, unitCost: 3200, warehouse: 'interior', detail: '' },




  { id: 'beef', name: 'Lomo vetado', type: 'consumable', category: 'meat', unit: 'kg', stockOnHand: 45, minStock: 30, unitCost: 12500, warehouse: 'insumos', detail: 'Cámara de frío', yieldRate: 0.75, cookingYield: 0.84 },
  { id: 'chicken', name: 'Pechuga de pollo', type: 'consumable', category: 'meat', unit: 'kg', stockOnHand: 38, minStock: 25, unitCost: 6800, warehouse: 'insumos', detail: 'Cámara de frío', yieldRate: 0.9, cookingYield: 0.75 },
  { id: 'salmon', name: 'Salmón', type: 'consumable', category: 'meat', unit: 'kg', stockOnHand: 12, minStock: 15, unitCost: 14200, warehouse: 'insumos', detail: 'Cámara de frío', yieldRate: 0.85, cookingYield: 0.8 },

  { id: 'potato', name: 'Papa', type: 'consumable', category: 'produce', unit: 'kg', stockOnHand: 80, minStock: 40, unitCost: 900, warehouse: 'insumos', detail: 'Despensa', yieldRate: 0.8, cookingYield: 0.95 },
  { id: 'salad-mix', name: 'Mix de ensaladas', type: 'consumable', category: 'produce', unit: 'kg', stockOnHand: 18, minStock: 20, unitCost: 3400, warehouse: 'insumos', detail: 'Cámara de frío', yieldRate: 0.85 },
  { id: 'lemon', name: 'Limón', type: 'consumable', category: 'produce', unit: 'kg', stockOnHand: 22, minStock: 10, unitCost: 1600, warehouse: 'insumos', detail: 'Despensa', yieldRate: 0.85 },

  { id: 'rice', name: 'Arroz', type: 'consumable', category: 'dry', unit: 'kg', stockOnHand: 60, minStock: 30, unitCost: 1400, warehouse: 'insumos', detail: 'Despensa', cookingYield: 2.8 },
  { id: 'oil', name: 'Aceite', type: 'consumable', category: 'dry', unit: 'litro', stockOnHand: 25, minStock: 20, unitCost: 2800, warehouse: 'insumos', detail: 'Despensa' },
  { id: 'salt', name: 'Sal', type: 'consumable', category: 'dry', unit: 'kg', stockOnHand: 14, minStock: 8, unitCost: 700, warehouse: 'insumos', detail: 'Despensa' },
  { id: 'flour', name: 'Harina', type: 'consumable', category: 'dry', unit: 'kg', stockOnHand: 35, minStock: 20, unitCost: 1100, warehouse: 'insumos', detail: 'Despensa' },

  { id: 'butter', name: 'Mantequilla', type: 'consumable', category: 'dairy', unit: 'kg', stockOnHand: 9, minStock: 12, unitCost: 8900, warehouse: 'insumos', detail: 'Cámara de frío' },
  { id: 'cream', name: 'Crema', type: 'consumable', category: 'dairy', unit: 'litro', stockOnHand: 16, minStock: 10, unitCost: 3200, warehouse: 'insumos', detail: 'Cámara de frío' },
  { id: 'cheese', name: 'Queso', type: 'consumable', category: 'dairy', unit: 'kg', stockOnHand: 11, minStock: 10, unitCost: 9500, warehouse: 'insumos', detail: 'Cámara de frío', yieldRate: 0.95 },

  { id: 'wine-red', name: 'Vino tinto', type: 'consumable', category: 'drinks', unit: 'botella', stockOnHand: 96, minStock: 60, unitCost: 5900, warehouse: 'insumos', detail: 'Cava' },
  { id: 'wine-white', name: 'Vino blanco', type: 'consumable', category: 'drinks', unit: 'botella', stockOnHand: 72, minStock: 60, unitCost: 5900, warehouse: 'insumos', detail: 'Cava' },
  { id: 'sparkling', name: 'Espumante', type: 'consumable', category: 'drinks', unit: 'botella', stockOnHand: 40, minStock: 40, unitCost: 7400, warehouse: 'insumos', detail: 'Cava' },
  { id: 'soda', name: 'Bebida gaseosa', type: 'consumable', category: 'drinks', unit: 'litro', stockOnHand: 110, minStock: 80, unitCost: 1300, warehouse: 'insumos', detail: 'Despensa' },
  { id: 'ice', name: 'Hielo', type: 'consumable', category: 'drinks', unit: 'kg', stockOnHand: 30, minStock: 50, unitCost: 800, warehouse: 'insumos', detail: 'Cámara de frío' },

  { id: 'napkin-paper', name: 'Servilleta de papel', type: 'consumable', category: 'disposable', unit: 'paquete', stockOnHand: 22, minStock: 15, unitCost: 1900, warehouse: 'insumos', detail: 'Despensa' },
  { id: 'candle', name: 'Vela decorativa', type: 'consumable', category: 'disposable', unit: 'unidad', stockOnHand: 45, minStock: 60, unitCost: 1200, warehouse: 'insumos', detail: '' }
]

export const itemById = Object.fromEntries(items.map((i) => [i.id, i]))
