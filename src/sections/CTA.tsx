import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PRICE } from '../data/product'
import { REDUCED_MOTION } from '../store'

gsap.registerPlugin(ScrollTrigger)

export default function CTA({ onPreorder }: { onPreorder: () => void }) {
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
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="cta" className="cta" ref={ref}>
      <div className="shell">
        <p className="eyebrow" data-reveal>Ships March 2026</p>
        <h2 data-reveal>
          Hear the
          <br />
          difference.
        </h2>
        <p className="lede" data-reveal>
          Reserve your AURA ONE today. No charge until it ships — cancel anytime.
        </p>
        <button className="btn btn-primary" data-reveal data-cursor data-sound="chime" onClick={onPreorder}>
          Pre-order — {PRICE} <span className="arrow">→</span>
        </button>
        <p className="fine" data-reveal>Free 2-day shipping · 30-night home trial · 2-year warranty</p>
      </div>
    </section>
  )
}
