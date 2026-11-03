/* The anatomy of AURA ONE — the parts behind the product page.
   The ids match the parts in the 3D model, so picking one here highlights
   the right piece in the scene. */
export type Part = {
  id: string
  name: string
  spec: string
  desc: string
}

export const ANATOMY: Part[] = [
  {
    id: 'shell',
    name: 'Anodised aluminium shell',
    spec: 'Single piece · 249 g',
    desc: 'One block of aluminium, machined and anodised, forms the acoustic chamber around the driver. It is the only part you ever see — and the only part that has to be perfect.',
  },
  {
    id: 'plate',
    name: 'Acoustic back plate',
    spec: 'Brushed aluminium',
    desc: 'A brushed plate seals the back of the chamber and doubles as the heatsink for the driver electronics.',
  },
  {
    id: 'ring',
    name: 'Illuminated accent ring',
    spec: 'Anodised, 0.4 mm',
    desc: 'A hairline anodised ring around the back plate. It carries the finish colour and the battery indicator.',
  },
  {
    id: 'cushion',
    name: 'Graphene-damped ear cushion',
    spec: 'Memory foam · 24 mm',
    desc: 'Slow-rebound foam wrapped in protein leather, damped so the cushions seal without adding pressure to the ear.',
  },
  {
    id: 'grille',
    name: 'Acoustic grille',
    spec: 'Woven, open weave',
    desc: 'A woven grille keeps dust out of the chamber while letting the high end through untouched.',
  },
  {
    id: 'diaphragm',
    name: 'Graphene diaphragm',
    spec: '40 mm',
    desc: 'A 40 mm graphene dome moves as a single piece, so transients stay tight instead of smearing.',
  },
  {
    id: 'magnet',
    name: 'N52 neodymium array',
    spec: '4 × 38 mm',
    desc: 'Four neodymium magnets drive the diaphragm with far less distortion at the same output level.',
  },
  {
    id: 'basket',
    name: 'Machined driver basket',
    spec: 'Aluminium',
    desc: 'The basket holds the voice coil in place and vents heat away from the acoustic chamber.',
  },
  {
    id: 'battery',
    name: 'Graphene-layered cell',
    spec: '40 h · 5 min = 6 h',
    desc: 'A graphene-layered cell runs for forty hours and recovers six hours of playback in five minutes.',
  },
  {
    id: 'mic',
    name: 'Hybrid ANC array',
    spec: '8 mics · 48 kHz',
    desc: 'Eight microphones sample the room 48,000 times a second; two of them measure the pressure inside the cup.',
  },
  {
    id: 'tracker',
    name: '6-axis head tracker',
    spec: '12 ms latency',
    desc: 'A gyroscope and accelerometer re-render the soundfield, keeping the music pinned to the room, not your head.',
  },
  {
    id: 'band',
    name: 'Self-adjusting headband',
    spec: '1.4 N clamp',
    desc: 'A steel core inside a memory band spreads the clamp across the whole crown instead of the ears.',
  },
  {
    id: 'yoke',
    name: 'Yoke and slider',
    spec: '304 steel',
    desc: 'A steel yoke lets each cup slide and pivot, so the seal follows the shape of your head.',
  },
]
