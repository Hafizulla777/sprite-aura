# SPRITE — AURA ONE · 3D Product Showcase

A production-ready, interactive 3D product showcase built with:

- **React 18 + TypeScript + Vite** — fast, modern toolchain
- **Three.js / React Three Fiber** — procedural 3D headphones (no external model files)
- **GSAP ScrollTrigger** — scroll-driven 3D choreography & reveal animations
- **Web Audio API** — synthesized click / hover / whoosh / chime sounds (zero audio files)

## Features

- Apple-style fixed WebGL canvas: the product glides & rotates as you scroll through sections
- Three colorways (Midnight, Pearl, Volt) — click swatches to recolor the live 3D model
- Synthesized UI sounds with a mute toggle (no copyrighted audio, fully offline-capable)
- Custom cursor, glass UI, responsive layout, reduced-motion support
- SEO meta tags, fast first paint, code-split vendor chunks

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
