import { useEffect, useRef, useState } from 'react'
import { COLORS, PRICE } from '../data/product'
import { appState } from '../store'
import { sound } from '../audio/sound'

type Props = {
  open: boolean
  onClose: () => void
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function orderId() {
  const n = Math.floor(Math.random() * 9000 + 1000)
  return `SP-${n}`
}

/* Pre-order sheet: pick a finish, drop an email, get a reservation code.
   No backend — the reservation is stored locally so the flow is complete
   and honest about what it does. */
export default function PreorderModal({ open, onClose }: Props) {
  const [finish, setFinish] = useState(appState.colorIndex)
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState<null | { id: string; finish: string; email: string }>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const restoreFocus = useRef<HTMLElement | null>(null)

  /* open: reset the sheet and move focus into it */
  useEffect(() => {
    if (!open) return
    restoreFocus.current = document.activeElement as HTMLElement | null
    setFinish(appState.colorIndex)
    setEmail('')
    setError('')
    setDone(null)
    const t = window.setTimeout(() => emailRef.current?.focus(), 60)
    return () => window.clearTimeout(t)
  }, [open])

  /* close: escape, and give focus back to whatever opened the sheet */
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
      restoreFocus.current?.focus?.()
    }
  }, [open, onClose])

  if (!open) return null

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const value = email.trim()
    if (!EMAIL_RE.test(value)) {
      setError('Enter a valid email so we can send your reservation.')
      emailRef.current?.focus()
      return
    }
    setError('')
    const id = orderId()
    const chosen = COLORS[finish]
    try {
      const list = JSON.parse(localStorage.getItem('sprite.preorders') || '[]')
      list.push({ id, finish: chosen.key, email: value, at: new Date().toISOString() })
      localStorage.setItem('sprite.preorders', JSON.stringify(list))
    } catch {
      /* storage unavailable (private mode) — the reservation still completes */
    }
    sound.play('chime')
    setDone({ id, finish: chosen.label, email: value })
  }

  return (
    <div className="sheet-backdrop" onPointerDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        ref={cardRef}
      >
        <button className="sheet-close" onClick={onClose} aria-label="Close pre-order" data-cursor>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <line x1="5" y1="5" x2="19" y2="19" />
            <line x1="19" y1="5" x2="5" y2="19" />
          </svg>
        </button>

        {done ? (
          <div className="sheet-done">
            <span className="tick" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <polyline points="4 12.5 9.5 18 20 6" />
              </svg>
            </span>
            <h2 id="sheet-title">You&apos;re on the list.</h2>
            <p className="sheet-lede">
              Reservation <b>{done.id}</b> for AURA ONE in <b>{done.finish}</b>. We&apos;ll email{' '}
              {done.email} before it ships in March 2026.
            </p>
            <button className="btn btn-primary" onClick={onClose} data-cursor data-sound="click">
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="eyebrow">Reserve yours</p>
            <h2 id="sheet-title">Pre-order AURA ONE</h2>
            <p className="sheet-lede">
              {PRICE} · no charge until it ships · cancel anytime
            </p>

            <form onSubmit={submit} noValidate>
              <fieldset className="sheet-finishes">
                <legend>Choose a finish</legend>
                {COLORS.map((c, i) => (
                  <button
                    type="button"
                    key={c.key}
                    className={`finish${i === finish ? ' active' : ''}`}
                    aria-pressed={i === finish}
                    onClick={() => {
                      setFinish(i)
                      appState.setColor(i)
                      sound.play('hover')
                    }}
                    data-cursor
                  >
                    <span className="chip" style={{ background: `radial-gradient(circle at 32% 30%, ${c.hex}, #000)` }} />
                    <span className="name">{c.label}</span>
                  </button>
                ))}
              </fieldset>

              <label className="sheet-field">
                <span>Email</span>
                <input
                  ref={emailRef}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError('')
                  }}
                  aria-invalid={!!error}
                  aria-describedby={error ? 'sheet-error' : undefined}
                />
              </label>

              {error && (
                <p className="sheet-error" id="sheet-error" role="alert">
                  {error}
                </p>
              )}

              <button type="submit" className="btn btn-primary sheet-submit" data-cursor data-sound="chime">
                Reserve for {PRICE} <span className="arrow">→</span>
              </button>
              <p className="sheet-fine">Free 2-day shipping · 30-night home trial · 2-year warranty</p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
