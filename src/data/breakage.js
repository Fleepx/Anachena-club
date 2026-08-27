export const breakageReports = [
  {
    id: 'br-p01',
    eventId: 'ev-p01',
    closedAt: '2026-07-26',
    closedBy: 'Ana Chena',
    lines: [
      { itemId: 'glass-wine-red', qty: 9, reason: 'broken' },
      { itemId: 'glass-water', qty: 6, reason: 'broken' },
      { itemId: 'plate-main', qty: 4, reason: 'broken' },
      { itemId: 'napkin-cloth', qty: 5, reason: 'missing' }
    ],
    status: 'confirmed',
    note: 'Se cayo una bandeja en el pasillo de cocina.'
  },
  {
    id: 'br-p02',
    eventId: 'ev-p02',
    closedAt: '2026-08-02',
    closedBy: 'Jorge Ramirez',
    lines: [
      { itemId: 'glass-long', qty: 11, reason: 'broken' },
      { itemId: 'chair-tiffany', qty: 3, reason: 'broken' },
      { itemId: 'plate-dessert', qty: 5, reason: 'broken' },
      { itemId: 'spoon-main', qty: 4, reason: 'missing' }
    ],
    status: 'confirmed',
    note: 'Curso numeroso, sillas forzadas. Dos patas quebradas.'
  },
  {
    id: 'br-p03',
    eventId: 'ev-p03',
    closedAt: '2026-08-09',
    closedBy: 'Ana Chena',
    lines: [
      { itemId: 'glass-champagne', qty: 14, reason: 'broken' },
      { itemId: 'glass-wine-red', qty: 8, reason: 'broken' },
      { itemId: 'plate-base', qty: 3, reason: 'broken' },
      { itemId: 'cup-coffee', qty: 6, reason: 'broken' },
      { itemId: 'mic-wireless', qty: 1, reason: 'broken' }
    ],
    status: 'confirmed',
    note: 'Brindis con copas de champagne, alta rotura. Un microfono cayo del atril.'
  }
]
