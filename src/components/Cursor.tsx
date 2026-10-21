import { useEffect, useRef, useState } from 'react'
import { sound } from '../audio/sound'
import { FINE_POINTER } from '../store'

/* Custom cursor (desktop only) + global synthesized UI sounds. */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const [enabled] = useState(FINE_POINTER)

  useEffect(() => {
    if (!enabled) return
    let mx = window.innerWidth / 2
    let my = window.innerHeight / 2
    let rx = mx
    let ry = my
    let raf = 0

    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      if (dot.current) dot.current.style.transform = `translate3d(${mx}px, ${my}px, 0)`
    }
    const loop = () => {
      rx += (mx - rx) * 0.16
      ry += (my - ry) * 0.16
      if (ring.current) ring.current.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(loop)
    }

    const over = (e: PointerEvent) => {
      const el = (e.target as HTMLElement).closest?.('a, button, [data-cursor]')
      ring.current?.classList.toggle('hovering', !!el)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', over, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', over)
      cancelAnimationFrame(raf)
    }
  }, [enabled])

  /* global sound binding: hover ticks + click sounds via data-sound attr */
  useEffect(() => {
    let last: Element | null = null
    const over = (e: Event) => {
      const el = (e.target as HTMLElement).closest?.('[data-sound]') as HTMLElement | null
      if (el && el !== last) {
        last = el
        sound.play('hover')
      } else if (!el) {
        last = null
      }
    }
    const click = (e: Event) => {
      const el = (e.target as HTMLElement).closest?.('[data-sound]') as HTMLElement | null
      const name = (el?.getAttribute('data-sound') || 'click') as 'click' | 'whoosh' | 'chime' | 'hover'
      sound.play(name === 'hover' ? 'click' : name)
    }
    document.addEventListener('pointerover', over, { passive: true })
    document.addEventListener('pointerdown', click, { passive: true })
    return () => {
      document.removeEventListener('pointerover', over)
      document.removeEventListener('pointerdown', click)
    }
  }, [])

  if (!enabled) return null
  return (
    <>
      <div ref={dot} className="cursor-dot" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}
