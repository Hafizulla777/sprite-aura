/**
 * Product finish renderer.
 *
 * Takes one studio photograph of the headphones and bakes the three product
 * finishes (Midnight / Pearl / Volt) as separate images. Each finish keeps the
 * real photographic shading — only the colour and the tonal curve change — and
 * the backdrop is pushed towards black so the page can composite the product
 * with `mix-blend-mode: screen`.
 *
 * Usage: node scripts/grade.mjs <input.jpg> <outDir> [maxWidth]
 */
import sharp from 'sharp'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const [, , src, outDir, maxWArg] = process.argv
if (!src || !outDir) {
  console.error('usage: node scripts/grade.mjs <input> <outDir> [maxWidth]')
  process.exit(1)
}

const MAX_W = Number(maxWArg ?? 1600)

/* the studio backdrop is pushed to black between these two luminances */
const FLOOR_LO = 0.30
const FLOOR_HI = 0.52

const FINISHES = [
  {
    key: 'midnight',
    gamma: 1.5, // cream -> graphite
    gain: 0.46,
    tint: [0.9, 0.96, 1.14], // cool blue cast
    mix: 0.85, // how far the original colour is replaced by the tint
    contrast: 1.25,
  },
  {
    key: 'pearl',
    gamma: 0.88, // keep the ceramic white
    gain: 1.0,
    tint: [1.03, 1.0, 0.95], // warm champagne cast
    mix: 0.35,
    contrast: 1.02,
  },
  {
    key: 'volt',
    gamma: 0.8,
    gain: 0.92,
    tint: [0.86, 1.14, 0.22], // high-visibility lime
    mix: 0.95,
    contrast: 1.1,
  },
]

const smooth = (x) => {
  const t = Math.min(Math.max(x, 0), 1)
  return t * t * (3 - 2 * t)
}

const { data, info } = await sharp(src)
  .resize({ width: MAX_W, withoutEnlargement: true })
  .removeAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true })

const { width: W, height: H, channels: C } = info
mkdirSync(outDir, { recursive: true })

const lumaAt = (i) => (0.2126 * data[i * C] + 0.7152 * data[i * C + 1] + 0.0722 * data[i * C + 2]) / 255

/* ---- find the product inside the frame (bright surfaces, contiguous) ---- */
const SUBJECT_LUMA = 0.55
const rowBright = new Int32Array(H)
for (let y = 0; y < H; y++) {
  let n = 0
  for (let x = 0; x < W; x++) if (lumaAt(y * W + x) > SUBJECT_LUMA) n++
  rowBright[y] = n
}
const rowMin = Math.max(4, Math.round(W * 0.05))
let minY = H
let maxY = 0
for (let y = 0; y < H; y++) {
  if (rowBright[y] >= rowMin) {
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }
}
let minX = W
let maxX = 0
for (let x = 0; x < W; x++) {
  let n = 0
  for (let y = minY; y <= maxY; y++) if (lumaAt(y * W + x) > SUBJECT_LUMA) n++
  if (n >= 4) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
  }
}
if (minX > maxX || minY > maxY) {
  minX = 0
  minY = 0
  maxX = W - 1
  maxY = H - 1
}
const padX = Math.round((maxX - minX) * 0.04)
const padY = Math.round((maxY - minY) * 0.06)
const crop = {
  left: Math.max(0, minX - padX),
  top: Math.max(0, minY - padY),
  width: Math.min(W - Math.max(0, minX - padX), maxX - minX + 1 + padX * 2),
  height: Math.min(H - Math.max(0, minY - padY), maxY - minY + 1 + padY * 2),
}

for (const finish of FINISHES) {
  const out = Buffer.alloc(W * H * 3)
  const cx = (crop.left + crop.width / 2) / W
  const cy = (crop.top + crop.height / 2) / H
  const rx = crop.width / W / 2
  const ry = crop.height / H / 2

  for (let i = 0; i < W * H; i++) {
    const r = data[i * C]
    const g = data[i * C + 1]
    const b = data[i * C + 2]
    const luma = lumaAt(i)

    // tonal curve
    let l = Math.pow(luma, finish.gamma) * finish.gain
    l = Math.min(Math.max((l - 0.5) * finish.contrast + 0.5, 0), 1)

    // backdrop -> black. The studio sweep is a cool blue-grey (blue > red),
    // the product is warm/neutral, so the tint separates the two cleanly.
    const cool = b - r > 5
    const keep = cool ? 0 : smooth((luma - FLOOR_LO) / (FLOOR_HI - FLOOR_LO))
    l *= keep

    // vignette: the studio backdrop fades out towards the frame edge so the
    // product can be composited on the page without a visible rectangle
    const x = (i % W) / W
    const y = Math.floor(i / W) / H
    const d = Math.hypot((x - cx) / rx, (y - cy) / ry)
    l *= 1 - smooth((d - 0.5) / 0.45)

    // tint, mixed with the original colour so real material detail survives
    const tr = Math.min(255, l * 255 * finish.tint[0])
    const tg = Math.min(255, l * 255 * finish.tint[1])
    const tb = Math.min(255, l * 255 * finish.tint[2])
    const m = finish.mix
    out[i * 3] = Math.min(255, Math.round(tr * m + r * (1 - m) * keep))
    out[i * 3 + 1] = Math.min(255, Math.round(tg * m + g * (1 - m) * keep))
    out[i * 3 + 2] = Math.min(255, Math.round(tb * m + b * (1 - m) * keep))
  }

  const file = join(outDir, `aura-one-${finish.key}.jpg`)
  await sharp(out, { raw: { width: W, height: H, channels: 3 } })
    .extract(crop)
    .jpeg({ quality: 88, progressive: true, chromaSubsampling: '4:4:4' })
    .toFile(file)
  console.log(`wrote ${file} (${crop.width}x${crop.height})`)
}
