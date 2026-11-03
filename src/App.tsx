import { useEffect, useRef, useState } from 'react'
import Scene, { usePointer } from './components/Scene'
import Navbar from './components/Navbar'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import PreorderModal from './components/PreorderModal'
import Hero from './sections/Hero'
import Features from './sections/Features'
import Anatomy from './sections/Anatomy'
import Specs from './sections/Specs'
import Colorways from './sections/Colorways'
import CTA from './sections/CTA'
import Footer from './sections/Footer'
import { appState } from './store'

export default function App() {
  const [progress, setProgress] = useState(8)
  const [ready, setReady] = useState(false)
  const [preorder, setPreorder] = useState(false)
  const ramp = useRef<number | null>(null)
  usePointer()

  /* fake-smooth loading progress (site has no heavy assets) */
  useEffect(() => {
    let p = 8
    ramp.current = window.setInterval(() => {
      p = Math.min(p + Math.random() * 16 + 6, 92)
      setProgress(Math.round(p))
      if (p >= 92 && ramp.current !== null) {
        clearInterval(ramp.current)
        ramp.current = null
      }
    }, 120)
    return () => {
      if (ramp.current !== null) clearInterval(ramp.current)
      ramp.current = null
    }
  }, [])

  /* when fonts + first paint are done, finish loading */
  useEffect(() => {
    const fonts = (document as any).fonts?.ready ?? Promise.resolve()
    let finished = false
    const finish = () => {
      if (finished) return
      finished = true
      /* stop the fake ramp before the final value, otherwise a late tick can
         push progress back below 100 and the loader never unmounts */
      if (ramp.current !== null) {
        clearInterval(ramp.current)
        ramp.current = null
      }
      setProgress(100)
      setTimeout(() => {
        setReady(true)
        appState.ready = true
      }, 250)
    }
    Promise.all([fonts]).then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(finish)
      })
    })
    /* safety net: never leave the visitor staring at the loader */
    const fallback = window.setTimeout(finish, 4000)
    return () => window.clearTimeout(fallback)
  }, [])

  return (
    <>
      <Loader progress={progress} />
      <Cursor />
      <div className="bg-glows" aria-hidden="true">
        <div className="glow glow-1" />
        <div className="glow glow-2" />
      </div>
      <div className="noise" aria-hidden="true" />
      <Scene />
      <Navbar onPreorder={() => setPreorder(true)} />
      <main className="content">
        <Hero ready={ready} onPreorder={() => setPreorder(true)} />
        <Features />
        <Anatomy />
        <Specs />
        <Colorways />
        <CTA onPreorder={() => setPreorder(true)} />
        <Footer />
      </main>
      <PreorderModal open={preorder} onClose={() => setPreorder(false)} />
    </>
  )
}
