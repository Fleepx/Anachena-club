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
  { id: 'chair-tiffany', name: 'Silla Tiffany', type: 'asset', category: 'seating', unit: 'unidad', stockOnHand: 280, stockOut: 0, stockBroken: 14, unitCost: 18000, warehouse: 'loza', detail: '' },
  { id: 'table-round', name: 'Mesa redonda 10p', type: 'asset', category: 'seating', unit: 'unidad', stockOnHand: 30, stockOut: 0, stockBroken: 1, unitCost: 85000, warehouse: 'loza', detail: '' },
  { id: 'table-rect', name: 'Mesa rectangular', type: 'asset', category: 'seating', unit: 'unidad', stockOnHand: 12, stockOut: 0, stockBroken: 0, unitCost: 70000, warehouse: 'loza', detail: '' },

  { id: 'tablecloth', name: 'Mantel redondo', type: 'asset', category: 'linen', unit: 'unidad', stockOnHand: 34, stockOut: 0, stockBroken: 3, unitCost: 22000, warehouse: 'delicada', detail: '' },
  { id: 'napkin-cloth', name: 'Servilleta de tela', type: 'asset', category: 'linen', unit: 'unidad', stockOnHand: 240, stockOut: 0, stockBroken: 20, unitCost: 2500, warehouse: 'delicada', detail: '' },
  { id: 'chair-cover', name: 'Funda de silla', type: 'asset', category: 'linen', unit: 'unidad', stockOnHand: 260, stockOut: 0, stockBroken: 8, unitCost: 4000, warehouse: 'delicada', detail: '' },

  { id: 'plate-base', name: 'Plato base', type: 'asset', category: 'tableware', unit: 'unidad', stockOnHand: 265, stockOut: 0, stockBroken: 11, unitCost: 5500, warehouse: 'loza', detail: '' },
  { id: 'plate-main', name: 'Plato de fondo', type: 'asset', category: 'tableware', unit: 'unidad', stockOnHand: 250, stockOut: 0, stockBroken: 18, unitCost: 4800, warehouse: 'loza', detail: '' },
  { id: 'plate-dessert', name: 'Plato de postre', type: 'asset', category: 'tableware', unit: 'unidad', stockOnHand: 230, stockOut: 0, stockBroken: 9, unitCost: 3900, warehouse: 'loza', detail: '' },
  { id: 'cup-coffee', name: 'Taza de café', type: 'asset', category: 'tableware', unit: 'unidad', stockOnHand: 180, stockOut: 0, stockBroken: 12, unitCost: 3200, warehouse: 'loza', detail: '' },

  { id: 'glass-water', name: 'Copa de agua', type: 'asset', category: 'glassware', unit: 'unidad', stockOnHand: 242, stockOut: 0, stockBroken: 22, unitCost: 2900, warehouse: 'delicada', detail: '' },
  { id: 'glass-wine-red', name: 'Copa de vino tinto', type: 'asset', category: 'glassware', unit: 'unidad', stockOnHand: 210, stockOut: 0, stockBroken: 30, unitCost: 3100, warehouse: 'delicada', detail: '' },
  { id: 'glass-wine-white', name: 'Copa de vino blanco', type: 'asset', category: 'glassware', unit: 'unidad', stockOnHand: 195, stockOut: 0, stockBroken: 17, unitCost: 3100, warehouse: 'delicada', detail: '' },
  { id: 'glass-champagne', name: 'Copa de champagne', type: 'asset', category: 'glassware', unit: 'unidad', stockOnHand: 160, stockOut: 0, stockBroken: 25, unitCost: 3400, warehouse: 'delicada', detail: '' },
  { id: 'glass-long', name: 'Vaso largo', type: 'asset', category: 'glassware', unit: 'unidad', stockOnHand: 220, stockOut: 0, stockBroken: 14, unitCost: 2100, warehouse: 'delicada', detail: '' },

  { id: 'fork-main', name: 'Tenedor', type: 'asset', category: 'cutlery', unit: 'unidad', stockOnHand: 255, stockOut: 0, stockBroken: 6, unitCost: 1800, warehouse: 'loza', detail: '' },
  { id: 'knife-main', name: 'Cuchillo', type: 'asset', category: 'cutlery', unit: 'unidad', stockOnHand: 248, stockOut: 0, stockBroken: 5, unitCost: 2200, warehouse: 'loza', detail: '' },
  { id: 'spoon-main', name: 'Cuchara', type: 'asset', category: 'cutlery', unit: 'unidad', stockOnHand: 251, stockOut: 0, stockBroken: 7, unitCost: 1800, warehouse: 'loza', detail: '' },
  { id: 'fork-dessert', name: 'Tenedor de postre', type: 'asset', category: 'cutlery', unit: 'unidad', stockOnHand: 205, stockOut: 0, stockBroken: 4, unitCost: 1500, warehouse: 'loza', detail: '' },

  { id: 'speaker', name: 'Parlante activo', type: 'asset', category: 'equipment', unit: 'unidad', stockOnHand: 4, stockOut: 0, stockBroken: 0, unitCost: 380000, warehouse: 'delicada', detail: 'Sala técnica', serialized: true },
  { id: 'mic-wireless', name: 'Micrófono inalámbrico', type: 'asset', category: 'equipment', unit: 'unidad', stockOnHand: 6, stockOut: 0, stockBroken: 1, unitCost: 145000, warehouse: 'delicada', detail: 'Sala técnica', serialized: true },
  { id: 'projector', name: 'Proyector', type: 'asset', category: 'equipment', unit: 'unidad', stockOnHand: 2, stockOut: 0, stockBroken: 0, unitCost: 520000, warehouse: 'delicada', detail: 'Sala técnica', serialized: true },
  { id: 'par-light', name: 'Foco PAR LED', type: 'asset', category: 'equipment', unit: 'unidad', stockOnHand: 16, stockOut: 0, stockBroken: 2, unitCost: 45000, warehouse: 'delicada', detail: 'Sala técnica' },

  { id: 'beef', name: 'Lomo vetado', type: 'consumable', category: 'meat', unit: 'kg', stockOnHand: 45, minStock: 30, unitCost: 12500, warehouse: 'abastecimiento', detail: 'Cámara de frío', yieldRate: 0.75, cookingYield: 0.84 },
  { id: 'chicken', name: 'Pechuga de pollo', type: 'consumable', category: 'meat', unit: 'kg', stockOnHand: 38, minStock: 25, unitCost: 6800, warehouse: 'abastecimiento', detail: 'Cámara de frío', yieldRate: 0.9, cookingYield: 0.75 },
  { id: 'salmon', name: 'Salmón', type: 'consumable', category: 'meat', unit: 'kg', stockOnHand: 12, minStock: 15, unitCost: 14200, warehouse: 'abastecimiento', detail: 'Cámara de frío', yieldRate: 0.85, cookingYield: 0.8 },

  { id: 'potato', name: 'Papa', type: 'consumable', category: 'produce', unit: 'kg', stockOnHand: 80, minStock: 40, unitCost: 900, warehouse: 'abastecimiento', detail: 'Despensa', yieldRate: 0.8, cookingYield: 0.95 },
  { id: 'salad-mix', name: 'Mix de ensaladas', type: 'consumable', category: 'produce', unit: 'kg', stockOnHand: 18, minStock: 20, unitCost: 3400, warehouse: 'abastecimiento', detail: 'Cámara de frío', yieldRate: 0.85 },
  { id: 'lemon', name: 'Limón', type: 'consumable', category: 'produce', unit: 'kg', stockOnHand: 22, minStock: 10, unitCost: 1600, warehouse: 'abastecimiento', detail: 'Despensa', yieldRate: 0.85 },

  { id: 'rice', name: 'Arroz', type: 'consumable', category: 'dry', unit: 'kg', stockOnHand: 60, minStock: 30, unitCost: 1400, warehouse: 'abastecimiento', detail: 'Despensa', cookingYield: 2.8 },
  { id: 'oil', name: 'Aceite', type: 'consumable', category: 'dry', unit: 'litro', stockOnHand: 25, minStock: 20, unitCost: 2800, warehouse: 'abastecimiento', detail: 'Despensa' },
  { id: 'salt', name: 'Sal', type: 'consumable', category: 'dry', unit: 'kg', stockOnHand: 14, minStock: 8, unitCost: 700, warehouse: 'abastecimiento', detail: 'Despensa' },
  { id: 'flour', name: 'Harina', type: 'consumable', category: 'dry', unit: 'kg', stockOnHand: 35, minStock: 20, unitCost: 1100, warehouse: 'abastecimiento', detail: 'Despensa' },

  { id: 'butter', name: 'Mantequilla', type: 'consumable', category: 'dairy', unit: 'kg', stockOnHand: 9, minStock: 12, unitCost: 8900, warehouse: 'abastecimiento', detail: 'Cámara de frío' },
  { id: 'cream', name: 'Crema', type: 'consumable', category: 'dairy', unit: 'litro', stockOnHand: 16, minStock: 10, unitCost: 3200, warehouse: 'abastecimiento', detail: 'Cámara de frío' },
  { id: 'cheese', name: 'Queso', type: 'consumable', category: 'dairy', unit: 'kg', stockOnHand: 11, minStock: 10, unitCost: 9500, warehouse: 'abastecimiento', detail: 'Cámara de frío', yieldRate: 0.95 },

  { id: 'wine-red', name: 'Vino tinto', type: 'consumable', category: 'drinks', unit: 'botella', stockOnHand: 96, minStock: 60, unitCost: 5900, warehouse: 'abastecimiento', detail: 'Cava' },
  { id: 'wine-white', name: 'Vino blanco', type: 'consumable', category: 'drinks', unit: 'botella', stockOnHand: 72, minStock: 60, unitCost: 5900, warehouse: 'abastecimiento', detail: 'Cava' },
  { id: 'sparkling', name: 'Espumante', type: 'consumable', category: 'drinks', unit: 'botella', stockOnHand: 40, minStock: 40, unitCost: 7400, warehouse: 'abastecimiento', detail: 'Cava' },
  { id: 'soda', name: 'Bebida gaseosa', type: 'consumable', category: 'drinks', unit: 'litro', stockOnHand: 110, minStock: 80, unitCost: 1300, warehouse: 'abastecimiento', detail: 'Despensa' },
  { id: 'ice', name: 'Hielo', type: 'consumable', category: 'drinks', unit: 'kg', stockOnHand: 30, minStock: 50, unitCost: 800, warehouse: 'abastecimiento', detail: 'Cámara de frío' },

  { id: 'napkin-paper', name: 'Servilleta de papel', type: 'consumable', category: 'disposable', unit: 'paquete', stockOnHand: 22, minStock: 15, unitCost: 1900, warehouse: 'abastecimiento', detail: 'Despensa' },
  { id: 'candle', name: 'Vela decorativa', type: 'consumable', category: 'disposable', unit: 'unidad', stockOnHand: 45, minStock: 60, unitCost: 1200, warehouse: 'abastecimiento', detail: '' }
]

export const itemById = Object.fromEntries(items.map((i) => [i.id, i]))
