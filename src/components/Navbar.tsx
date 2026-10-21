import { useEffect, useState } from 'react'
import { sound } from '../audio/sound'
import { PRICE } from '../data/product'

const LINKS = [
  { href: '#top', label: 'Overview' },
  { href: '#features', label: 'Features' },
  { href: '#specs', label: 'Specs' },
  { href: '#colors', label: 'Colors' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [muted, setMuted] = useState(sound.muted)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header className={`nav${scrolled ? ' scrolled' : ''}`}>
      <a href="#top" className="nav-logo" data-cursor onClick={(e) => go(e, '#top')} data-sound="click">
        <span className="dot" /> SPRITE
      </a>

      <nav className="nav-links" aria-label="Sections">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} data-cursor data-sound="hover" onClick={(e) => go(e, l.href)}>
            {l.label}
          </a>
        ))}
      </nav>

      <div className="nav-right">
        <button
          className="sound-toggle"
          aria-label={muted ? 'Unmute UI sounds' : 'Mute UI sounds'}
          data-cursor
          onClick={() => {
            sound.muted = !sound.muted
            setMuted(sound.muted)
            if (!sound.muted) sound.play('click')
          }}
        >
          {muted ? (
            /* muted icon */
            <svg viewBox="0 0 24 24">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <line x1="22" y1="9" x2="16" y2="15" />
              <line x1="16" y1="9" x2="22" y2="15" />
            </svg>
          ) : (
            /* sound-on icon */
            <svg viewBox="0 0 24 24">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </svg>
          )}
        </button>
        <a href="#cta" className="btn btn-primary" data-cursor data-sound="chime" onClick={(e) => go(e, '#cta')}>
          Pre-order {PRICE}
        </a>
      </div>
    </header>
  )
}
