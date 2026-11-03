export const COLORS = [
  {
    key: 'midnight',
    label: 'Midnight',
    hex: '#191c22',
    accent: '#8ab4ff',
    blurb: 'Anodized graphite shell · icy blue accents',
    image: '/product/aura-one-midnight.jpg',
  },
  {
    key: 'pearl',
    label: 'Pearl',
    hex: '#e9e5dd',
    accent: '#c8a86b',
    blurb: 'Ceramic-white finish · warm champagne accents',
    image: '/product/aura-one-pearl.jpg',
  },
  {
    key: 'volt',
    label: 'Volt',
    hex: '#c9f24d',
    accent: '#1d2210',
    blurb: 'High-visibility lime · stealth black accents',
    image: '/product/aura-one-volt.jpg',
  },
] as const

export const FEATURES = [
  {
    title: 'Adaptive spatial audio',
    body: 'A 6-axis head tracker re-renders the soundfield in 12ms — music stays pinned to the room, not your head.',
    icon: 'spatial',
  },
  {
    title: '40-hour marathon cell',
    body: 'Graphene-layered battery with 5-minute quick-charge for 6 hours of playback. Fly long-haul twice on one charge.',
    icon: 'battery',
  },
  {
    title: 'Silence, engineered',
    body: 'Eight microphones sample the world 48,000 times a second. Hybrid ANC erases engines, offices, and everything between.',
    icon: 'anc',
  },
] as const

export const SPECS = [
  { value: 40, suffix: 'h', label: 'Battery life' },
  { value: 12, suffix: 'ms', label: 'Wireless latency' },
  { value: 3, suffix: '', label: 'Drivers per cup' },
  { value: 249, suffix: 'g', label: 'Total weight' },
] as const

export const PRICE = '$349'
