export const setups = [
  {
    id: 'wedding',
    name: 'Boda',
    kind: 'setup',
    lines: [
      { itemId: 'chair-tiffany', perGuest: 1 },
      { itemId: 'chair-cover', perGuest: 1 },
      { itemId: 'table-round', perGuest: 0.1 },
      { itemId: 'tablecloth', perGuest: 0.1 },
      { itemId: 'napkin-cloth', perGuest: 1 },
      { itemId: 'plate-base', perGuest: 1 },
      { itemId: 'plate-main', perGuest: 1 },
      { itemId: 'plate-dessert', perGuest: 1 },
      { itemId: 'cup-coffee', perGuest: 1 },
      { itemId: 'glass-water', perGuest: 1 },
      { itemId: 'glass-wine-red', perGuest: 1 },
      { itemId: 'glass-wine-white', perGuest: 1 },
      { itemId: 'glass-champagne', perGuest: 1 },
      { itemId: 'fork-main', perGuest: 1 },
      { itemId: 'knife-main', perGuest: 1 },
      { itemId: 'spoon-main', perGuest: 1 },
      { itemId: 'fork-dessert', perGuest: 1 },
      { itemId: 'speaker', qty: 2 },
      { itemId: 'mic-wireless', qty: 2 },
      { itemId: 'par-light', qty: 8 }
    ]
  },
  {
    id: 'graduation',
    name: 'Graduación',
    kind: 'setup',
    lines: [
      { itemId: 'chair-tiffany', perGuest: 1 },
      { itemId: 'table-round', perGuest: 0.1 },
      { itemId: 'tablecloth', perGuest: 0.1 },
      { itemId: 'plate-main', perGuest: 1 },
      { itemId: 'plate-dessert', perGuest: 1 },
      { itemId: 'glass-water', perGuest: 1 },
      { itemId: 'glass-long', perGuest: 1 },
      { itemId: 'fork-main', perGuest: 1 },
      { itemId: 'knife-main', perGuest: 1 },
      { itemId: 'spoon-main', perGuest: 1 },
      { itemId: 'speaker', qty: 2 },
      { itemId: 'mic-wireless', qty: 3 },
      { itemId: 'projector', qty: 1 },
      { itemId: 'par-light', qty: 6 }
    ]
  },
  {
    id: 'gala',
    name: 'Gala corporativa',
    kind: 'setup',
    lines: [
      { itemId: 'chair-tiffany', perGuest: 1 },
      { itemId: 'chair-cover', perGuest: 1 },
      { itemId: 'table-round', perGuest: 0.1 },
      { itemId: 'tablecloth', perGuest: 0.1 },
      { itemId: 'napkin-cloth', perGuest: 1 },
      { itemId: 'plate-base', perGuest: 1 },
      { itemId: 'plate-main', perGuest: 1 },
      { itemId: 'plate-dessert', perGuest: 1 },
      { itemId: 'glass-water', perGuest: 1 },
      { itemId: 'glass-wine-red', perGuest: 1 },
      { itemId: 'glass-champagne', perGuest: 1 },
      { itemId: 'fork-main', perGuest: 1 },
      { itemId: 'knife-main', perGuest: 1 },
      { itemId: 'fork-dessert', perGuest: 1 },
      { itemId: 'speaker', qty: 2 },
      { itemId: 'mic-wireless', qty: 2 },
      { itemId: 'projector', qty: 1 },
      { itemId: 'par-light', qty: 10 }
    ]
  },
  {
    id: 'birthday',
    name: 'Cumpleaños',
    kind: 'setup',
    lines: [
      { itemId: 'chair-tiffany', perGuest: 1 },
      { itemId: 'table-round', perGuest: 0.1 },
      { itemId: 'tablecloth', perGuest: 0.1 },
      { itemId: 'plate-main', perGuest: 1 },
      { itemId: 'plate-dessert', perGuest: 1 },
      { itemId: 'glass-long', perGuest: 1 },
      { itemId: 'glass-water', perGuest: 1 },
      { itemId: 'fork-main', perGuest: 1 },
      { itemId: 'knife-main', perGuest: 1 },
      { itemId: 'speaker', qty: 2 },
      { itemId: 'mic-wireless', qty: 1 },
      { itemId: 'par-light', qty: 6 }
    ]
  }
]

export const menus = [
  {
    id: 'menu-wedding',
    name: 'Lomo vetado con papas',
    kind: 'menu',
    lines: [
      { itemId: 'beef', perGuest: 0.25 },
      { itemId: 'potato', perGuest: 0.2 },
      { itemId: 'salad-mix', perGuest: 0.12 },
      { itemId: 'butter', perGuest: 0.03 },
      { itemId: 'cream', perGuest: 0.05 },
      { itemId: 'wine-red', perGuest: 0.25 },
      { itemId: 'wine-white', perGuest: 0.2 },
      { itemId: 'sparkling', perGuest: 0.2 },
      { itemId: 'soda', perGuest: 0.5 },
      { itemId: 'ice', perGuest: 0.3 },
      { itemId: 'candle', perGuest: 0.15 },
      { itemId: 'napkin-paper', perGuest: 0.05 }
    ]
  },
  {
    id: 'menu-graduation',
    name: 'Pollo con arroz',
    kind: 'menu',
    lines: [
      { itemId: 'chicken', perGuest: 0.22 },
      { itemId: 'rice', perGuest: 0.15 },
      { itemId: 'salad-mix', perGuest: 0.1 },
      { itemId: 'soda', perGuest: 0.6 },
      { itemId: 'ice', perGuest: 0.25 },
      { itemId: 'napkin-paper', perGuest: 0.06 }
    ]
  },
  {
    id: 'menu-gala',
    name: 'Salmon con papas',
    kind: 'menu',
    lines: [
      { itemId: 'salmon', perGuest: 0.2 },
      { itemId: 'potato', perGuest: 0.18 },
      { itemId: 'lemon', perGuest: 0.05 },
      { itemId: 'cream', perGuest: 0.04 },
      { itemId: 'wine-red', perGuest: 0.3 },
      { itemId: 'sparkling', perGuest: 0.25 },
      { itemId: 'soda', perGuest: 0.4 },
      { itemId: 'ice', perGuest: 0.3 },
      { itemId: 'candle', perGuest: 0.2 }
    ]
  },
  {
    id: 'menu-birthday',
    name: 'Pollo con papas',
    kind: 'menu',
    lines: [
      { itemId: 'chicken', perGuest: 0.25 },
      { itemId: 'potato', perGuest: 0.2 },
      { itemId: 'cheese', perGuest: 0.08 },
      { itemId: 'soda', perGuest: 0.7 },
      { itemId: 'ice', perGuest: 0.3 },
      { itemId: 'candle', perGuest: 0.2 },
      { itemId: 'napkin-paper', perGuest: 0.06 }
    ]
  }
]

export const cocktails = [
  {
    id: 'cocktail-clasico',
    name: 'Cóctel clásico',
    kind: 'cocktail',
    lines: [
      { itemId: 'salmon', perGuest: 0.06 },
      { itemId: 'cheese', perGuest: 0.05 },
      { itemId: 'lemon', perGuest: 0.02 },
      { itemId: 'butter', perGuest: 0.01 },
      { itemId: 'sparkling', perGuest: 0.15 },
      { itemId: 'napkin-paper', perGuest: 0.04 }
    ]
  },
  {
    id: 'cocktail-simple',
    name: 'Cóctel simple',
    kind: 'cocktail',
    lines: [
      { itemId: 'cheese', perGuest: 0.04 },
      { itemId: 'flour', perGuest: 0.03 },
      { itemId: 'sparkling', perGuest: 0.12 },
      { itemId: 'soda', perGuest: 0.2 },
      { itemId: 'napkin-paper', perGuest: 0.04 }
    ]
  },
  {
    id: 'cocktail-premium',
    name: 'Cóctel premium',
    kind: 'cocktail',
    lines: [
      { itemId: 'salmon', perGuest: 0.09 },
      { itemId: 'beef', perGuest: 0.07 },
      { itemId: 'cheese', perGuest: 0.06 },
      { itemId: 'lemon', perGuest: 0.03 },
      { itemId: 'cream', perGuest: 0.02 },
      { itemId: 'sparkling', perGuest: 0.25 },
      { itemId: 'napkin-paper', perGuest: 0.05 }
    ]
  }
]
