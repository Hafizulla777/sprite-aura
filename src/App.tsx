import { useEffect, useState } from 'react'
import Scene, { usePointer } from './components/Scene'
import Navbar from './components/Navbar'
import Cursor from './components/Cursor'
import Loader from './components/Loader'
import Hero from './sections/Hero'
import Features from './sections/Features'
import Specs from './sections/Specs'
import Colorways from './sections/Colorways'
import CTA from './sections/CTA'
import Footer from './sections/Footer'
import { appState } from './store'

export default function App() {
  const [progress, setProgress] = useState(8)
  const [ready, setReady] = useState(false)
  usePointer()

  /* fake-smooth loading progress (site has no heavy assets) */
  useEffect(() => {
    let p = 8
    const iv = setInterval(() => {
      p = Math.min(p + Math.random() * 16 + 6, 92)
      setProgress(Math.round(p))
      if (p >= 92) clearInterval(iv)
    }, 120)
    return () => clearInterval(iv)
  }, [])

  /* when fonts + first paint are done, finish loading */
  useEffect(() => {
    const fonts = (document as any).fonts?.ready ?? Promise.resolve()
    Promise.all([fonts]).then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setProgress(100)
          setTimeout(() => {
            setReady(true)
            appState.ready = true
          }, 250)
        })
      })
    })
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
      <Navbar />
      <div className="content">
        <Hero ready={ready} />
        <Features />
        <Specs />
        <Colorways />
        <CTA />
        <Footer />
      </div>
    </>
  )
}
