import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { COLORS } from '../data/product'
import { appState, REDUCED_MOTION } from '../store'

gsap.registerPlugin(ScrollTrigger)

export default function Colorways() {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (!ref.current) return
    const ctx = gsap.context(() => {
      if (REDUCED_MOTION) return
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 54,
          autoAlpha: 0,
          duration: 1.05,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 86%', once: true },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  const pick = (i: number) => {
    setActive(i)
    appState.colorIndex = i
  }

  return (
    <section id="colors" className="colorways" ref={ref}>
      <div className="shell">
        <p className="eyebrow" data-reveal>Colorways</p>
        <h2 data-reveal>Choose your finish.</h2>
        <p className="lede" data-reveal>
          Tap a swatch — the model updates live. Three finishes, each anodized to a different grain.
        </p>

        <div className="swatches" data-reveal>
          {COLORS.map((c, i) => (
            <button
              key={c.key}
              className={`swatch${i === active ? ' active' : ''}`}
              data-cursor
              data-sound="click"
              aria-pressed={i === active}
              onClick={() => pick(i)}
            >
              <span className="chip" style={{ background: `radial-gradient(circle at 32% 30%, ${c.hex}, #000)` }} />
              <span className="name">{c.label}</span>
              <span className="blurb">{c.blurb}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
