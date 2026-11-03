# SPRITE — AURA ONE · Product Showcase

A production-ready product landing page built with:

- **React 18 + TypeScript + Vite** — fast, modern toolchain
- **Real product photography** — the headphones are a real studio photo, colour-graded per finish
- **GSAP ScrollTrigger** — scroll-driven reveal animations
- **Web Audio API** — synthesized click / hover / whoosh / chime sounds (zero audio files)

## Features

- Apple-style fixed product stage: the photo glides & rotates as you scroll through sections
- **Inside AURA ONE** — an interactive cutaway: scroll to take the headphone apart into its ten parts, then tap any piece (driver, magnets, diaphragm, ear cushion, battery, ANC array, head tracker…) to read what it does
- Three colorways (Midnight, Pearl, Volt) — pick a swatch and the photography changes finish live
- Pre-order sheet: pick a finish, enter an email, get a reservation code (validated, keyboard-accessible, stores locally)
- Synthesized UI sounds with a mute toggle (no copyrighted audio, fully offline-capable)
- Custom cursor, glass UI, responsive layout, reduced-motion support
- SEO meta tags, `robots.txt`, fast first paint, code-split vendor chunks

## Product photography

The product is **not** a render — it is a real photograph (`assets/source/aura-one.jpg`).
`scripts/make-finishes.mjs` bakes the three finishes from that single shot:

- the cool blue studio backdrop is keyed out (blue channel > red channel ⇒ backdrop),
- the tonal curve per finish (graphite / ceramic-white / lime),
- a vignette so the frame fades to black and composites over the page.

```bash
npm run assets     # assets/source/aura-one.jpg -> public/product/aura-one-*.jpg
```

Source photo: [Pexels](https://www.pexels.com/) (free to use, no attribution required).
Swap in your own product shot and re-run `npm run assets` to regenerate every finish.

## The cutaway

`src/sections/Anatomy.tsx` draws the headphone as a vector cross-section. Every part is its own
SVG group, so the scroll choreography can slide it out of the assembly:

- the part list (names, specs, copy, explode offsets) lives in `src/data/anatomy.ts`
- progress is driven by scroll position, and the **Assembled / Exploded** buttons take over control
- parts are focusable and announce their name and spec to screen readers

## The sequence

The product is **closed** on arrival, turns **one full revolution** on its way into the cutaway
section, and is then **opened** into its ten parts. The turn is a real 3D rotation of the
photograph (`rotateY` on a perspective stage) with a mirrored back face, so the product never
disappears mid-turn. It is damped rather than tied 1:1 to the scroll, so it reads as one
deliberate move instead of a spin.


## Notes

- The finish picker and the pre-order sheet share one source of truth (`appState.setColor`), so
  whichever surface you pick from, the product photo and the swatch row always agree.
- The pre-order flow is client-side only — reservations are written to `localStorage`
  (`sprite.preorders`). Wire `submit()` in `src/components/PreorderModal.tsx` to a real endpoint
  when a backend is available.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # serve the production build
```

## Deploy

- **Vercel**: import the repo — framework auto-detected (Vite), build `npm run build`, output `dist`
- **Render**: Static Site → build `npm run build`, publish `dist`

© 2026 Sprite Labs
