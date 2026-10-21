import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FEATURES } from '../data/product'
import { REDUCED_MOTION } from '../store'

gsap.registerPlugin(ScrollTrigger)

const ICONS: Record<string, JSX.Element> = {
  spatial: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      <path d="M5.6 5.6 7.7 7.7M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" opacity="0.5" />
    </svg>
  ),
  battery: (
    <svg viewBox="0 0 24 24">
      <rect x="2" y="7" width="17" height="10" rx="3" />
      <path d="M22 11v2" />
      <path d="m11 9-2.2 3.4h4L10.6 16" />
    </svg>
  ),
  anc: (
    <svg viewBox="0 0 24 24">
      <path d="M3 12a9 9 0 0 1 9-9" opacity="0.45" />
      <path d="M6.5 12a5.5 5.5 0 0 1 5.5-5.5" opacity="0.7" />
      <circle cx="12" cy="12" r="1.6" />
      <path d="M15 19 21 5" />
    </svg>
  ),
}

export default function Features() {
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
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="features" className="features" ref={ref}>
      <div className="shell">
        <div className="max">
          <p className="eyebrow" data-reveal>Overview</p>
          <h2 data-reveal>
            Engineered to
            <br />
            disappear.
          </h2>
          <p className="lede" data-reveal>
            Every gram, every millimetre, every millisecond — tuned so the hardware vanishes and only the music
            remains.
          </p>
        </div>

        <div className="feature-grid">
          {FEATURES.map((f) => (
            <article key={f.title} className="feature-card" data-reveal data-cursor data-sound="hover">
              <div className="feature-icon">{ICONS[f.icon]}</div>
              <div>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
