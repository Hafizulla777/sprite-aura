import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { PRICE } from '../data/product'
import { REDUCED_MOTION } from '../store'

export default function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!ready || !ref.current) return
    const ctx = gsap.context(() => {
      if (REDUCED_MOTION) {
        gsap.set('[data-hero]', { yPercent: 0, autoAlpha: 1 })
        return
      }
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo('.hero h1 .line span', { yPercent: 115 }, { yPercent: 0, duration: 1.25, stagger: 0.09 }, 0.1)
        .fromTo('[data-hero]', { y: 26, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.09 }, 0.5)
        .fromTo('.scroll-hint', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.1)
    }, ref)
    return () => ctx.revert()
  }, [ready])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="top" className="hero" ref={ref}>
      <div className="ghost-word">AURA</div>
      <div className="shell">
        <div className="hero-copy">
          <p className="eyebrow" data-hero>Introducing</p>
          <h1>
            <span className="line">
              <span>AURA</span>
            </span>
            <span className="line">
              <span className="thin">ONE</span>
            </span>
          </h1>
          <p className="hero-sub" data-hero>
            Headphones that disappear on your head and <strong>reappear in your music.</strong> Adaptive spatial
            audio, 40-hour endurance, silence engineered from the driver up.
          </p>
          <div className="hero-ctas" data-hero>
            <a href="#cta" className="btn btn-primary" data-cursor data-sound="chime" onClick={(e) => go(e, '#cta')}>
              Pre-order now <span className="arrow">→</span>
            </a>
            <a href="#features" className="btn btn-ghost" data-cursor data-sound="whoosh" onClick={(e) => go(e, '#features')}>
              Explore in 3D
            </a>
          </div>
          <p className="hero-price" data-hero>
            <b>{PRICE}</b> · free shipping · ships March 2026
          </p>
        </div>
        <div aria-hidden="true" />
      </div>
      <div className="scroll-hint">
        <div className="wheel" />
        Scroll to explore
      </div>
    </section>
  )
}
