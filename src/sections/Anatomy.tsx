import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ANATOMY, type Part } from '../data/anatomy'
import { REDUCED_MOTION, appState } from '../store'
import { sound } from '../audio/sound'

/* The cutaway is driven from here: scrolling through the section opens the
   3D model (appState.open), and picking a part highlights it in the scene. */
export default function Anatomy() {
  const root = useRef<HTMLElement>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [open, setOpen] = useState(REDUCED_MOTION)

  useEffect(() => appState.subscribe(() => setSelected(appState.selectedPart)), [])

  /* scroll drives the opening */
  useEffect(() => {
    if (REDUCED_MOTION) {
      appState.setOpen(1)
      return
    }
    const update = () => {
      const sec = root.current
      if (!sec) return
      const rect = sec.getBoundingClientRect()
      const vh = window.innerHeight
      const start = vh * 0.3
      const end = -vh * 0.3
      const p = Math.min(Math.max((start - rect.top) / (start - end), 0), 1)
      appState.setOpen(p)
      setOpen(p > 0.5)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const pick = (id: string) => {
    const next = selected === id ? null : id
    setSelected(next)
    appState.setSelectedPart(next)
    sound.play('click')
  }

  const active: Part | null = ANATOMY.find((p) => p.id === selected) ?? null

  return (
    <section id="anatomy" className="anatomy" ref={root}>
      <div className="shell an-shell">
        <div className="an-head">
          <p className="eyebrow" data-reveal>
            Inside AURA ONE
          </p>
          <h2 data-reveal>
            Open it up.
            <br />
            Nothing to hide.
          </h2>
          <p className="lede" data-reveal>
            Ten parts, one acoustic chamber. Keep scrolling to take the headphone apart, then pick a part to
            see what it does.
          </p>
          <div className="an-controls" data-reveal>
            <button
              className={`an-btn${!open ? ' on' : ''}`}
              onClick={() => {
                gsap.to(appState, { open: 0, duration: 0.9, ease: 'power3.inOut', overwrite: true })
                setOpen(false)
              }}
              data-cursor
              data-sound="click"
            >
              Closed
            </button>
            <button
              className={`an-btn${open ? ' on' : ''}`}
              onClick={() => {
                gsap.to(appState, { open: 1, duration: 1.2, ease: 'power3.inOut', overwrite: true })
                setOpen(true)
              }}
              data-cursor
              data-sound="whoosh"
            >
              Opened
            </button>
          </div>
        </div>

        <div className="an-grid" data-reveal>
          <ul className="an-list">
            {ANATOMY.map((p) => (
              <li key={p.id}>
                <button
                  className={`an-item${selected === p.id ? ' on' : ''}`}
                  onClick={() => pick(p.id)}
                  aria-pressed={selected === p.id}
                  data-cursor
                >
                  <span className="an-item-name">{p.name}</span>
                  <span className="an-item-spec">{p.spec}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className={`an-card${active ? ' on' : ''}`} aria-live="polite">
            {active ? (
              <>
                <p className="an-card-eyebrow">{active.spec}</p>
                <h3>{active.name}</h3>
                <p>{active.desc}</p>
                <button className="an-card-close" onClick={() => pick(active.id)} data-cursor>
                  Close
                </button>
              </>
            ) : (
              <>
                <p className="an-card-eyebrow">Ten parts</p>
                <h3>Pick a part</h3>
                <p>
                  Every component is listed with the job it does. Tap any piece in the list to highlight it in
                  the model and read what it is and why it is there.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
