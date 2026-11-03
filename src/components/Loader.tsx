import { useEffect, useRef, useState } from 'react'

/* Loading overlay: brand + progress bar. Hides once real progress hits 100%. */
export default function Loader({ progress }: { progress: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const timer = useRef<number | null>(null)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    if (progress >= 100 && ref.current) {
      const el = ref.current
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease'
      el.style.opacity = '0'
      el.style.transform = 'translateY(-12px)'
      /* the removal timer must survive a later progress change, otherwise the
         overlay stays in the DOM forever (invisible, but present) */
      if (timer.current === null) {
        timer.current = window.setTimeout(() => {
          timer.current = null
          setGone(true)
        }, 650)
      }
    }
  }, [progress])

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    [],
  )

  if (gone) return null
  return (
    <div ref={ref} className="loader">
      <div className="brand">SPRITE</div>
      <div className="track">
        <div className="fill" style={{ transform: `scaleX(${Math.min(progress, 100) / 100})` }} />
      </div>
      <div className="status">{progress < 100 ? 'Calibrating drivers…' : 'Ready'}</div>
    </div>
  )
}
