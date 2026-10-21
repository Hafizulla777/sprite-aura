import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SPECS } from '../data/product'
import { REDUCED_MOTION } from '../store'

gsap.registerPlugin(ScrollTrigger)

export default function Specs() {
  const ref = useRef<HTMLElement>(null)

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

      gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
        const end = Number(el.dataset.count)
        const obj = { v: 0 }
        ScrollTrigger.create({
          trigger: el,
          start: 'top 88%',
          once: true,
          onEnter: () =>
            gsap.to(obj, {
              v: end,
              duration: 1.7,
              ease: 'power2.out',
              onUpdate: () => {
                el.firstChild && (el.firstChild.textContent = String(Math.round(obj.v)))
              },
            }),
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="specs" className="specs" ref={ref}>
      <div className="shell">
        <div className="specs-copy">
          <p className="eyebrow" data-reveal>Specifications</p>
          <h2 data-reveal>
            Numbers that
            <br />
            disappear too.
          </h2>
          <p className="lede" data-reveal>
            Specs you'll forget about — because you'll never think about them again.
          </p>

          <div className="spec-grid" data-reveal>
            {SPECS.map((s) => (
              <div key={s.label} className="spec-cell" data-cursor data-sound="hover">
                <div className="spec-num">
                  <span data-count={s.value}>{REDUCED_MOTION ? s.value : 0}</span>
                  {s.suffix && <span className="unit">{s.suffix}</span>}
                </div>
                <div className="spec-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
