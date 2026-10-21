import { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import { appState } from '../store'
import { COLORS } from '../data/product'

/* ---- scroll keyframes: one pose per section ---- */
type Pose = { pos: THREE.Vector3; rot: THREE.Euler; scale: number }
const POSES: Pose[] = [
  { pos: new THREE.Vector3(1.35, -0.05, 0), rot: new THREE.Euler(0.12, -0.55, 0.02), scale: 1 },     // hero
  { pos: new THREE.Vector3(1.5, 0.05, -0.4), rot: new THREE.Euler(0.18, 0.85, 0.04), scale: 0.92 },   // features
  { pos: new THREE.Vector3(-1.5, 0, 0.1), rot: new THREE.Euler(0.06, -1.15, -0.06), scale: 1.08 },    // specs
  { pos: new THREE.Vector3(0, -0.15, 0.55), rot: new THREE.Euler(0.22, 0.25, 0), scale: 1.18 },       // colorways
  { pos: new THREE.Vector3(0, 0.15, -0.7), rot: new THREE.Euler(0.1, -0.4, 0.03), scale: 0.85 },      // cta
]

const targetPos = new THREE.Vector3()
const targetRot = new THREE.Euler()
const tmpA = new THREE.Color()
const tmpB = new THREE.Color()

function smoothstep(x: number) {
  return x * x * (3 - 2 * x)
}

function Headphones() {
  const outer = useRef<THREE.Group>(null)  // scroll-driven
  const inner = useRef<THREE.Group>(null)  // idle + pointer parallax

  const shellColor = new THREE.Color(COLORS[0].hex)
  const accentColor = new THREE.Color(COLORS[0].accent)

  useFrame((state, dt) => {
    const d = Math.min(dt, 0.05)
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0

    const seg = p * (POSES.length - 1)
    const i = Math.min(Math.floor(seg), POSES.length - 2)
    const f = smoothstep(seg - i)
    const a = POSES[i]
    const b = POSES[i + 1]

    targetPos.lerpVectors(a.pos, b.pos, f)
    targetRot.x = THREE.MathUtils.lerp(a.rot.x, b.rot.x, f)
    targetRot.y = THREE.MathUtils.lerp(a.rot.y, b.rot.y, f)
    targetRot.z = THREE.MathUtils.lerp(a.rot.z, b.rot.z, f)
    const scale = THREE.MathUtils.lerp(a.scale, b.scale, f)

    // responsive tweaks
    const w = state.size.width
    if (w < 768) {
      targetPos.x *= 0.12
      targetPos.y += 0.25
    } else if (w < 1100) {
      targetPos.x *= 0.6
    }
    const s = w < 768 ? scale * 0.62 : w < 1100 ? scale * 0.8 : scale

    const g = outer.current
    if (g) {
      g.position.lerp(targetPos, 1 - Math.exp(-d * 5))
      g.rotation.x = THREE.MathUtils.lerp(g.rotation.x, targetRot.x, 1 - Math.exp(-d * 5))
      g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, targetRot.y, 1 - Math.exp(-d * 5))
      g.rotation.z = THREE.MathUtils.lerp(g.rotation.z, targetRot.z, 1 - Math.exp(-d * 5))
      const ns = THREE.MathUtils.lerp(g.scale.x, s, 1 - Math.exp(-d * 5))
      g.scale.set(ns, ns, ns)
    }

    // idle float + pointer parallax
    const t = state.clock.elapsedTime
    const n = inner.current
    if (n) {
      n.position.y = Math.sin(t * 0.9) * 0.045
      n.rotation.y = THREE.MathUtils.lerp(n.rotation.y, Math.sin(t * 0.5) * 0.1 + appState.pointerX * 0.28, 0.06)
      n.rotation.x = THREE.MathUtils.lerp(n.rotation.x, -appState.pointerY * 0.16, 0.06)
    }

    // live colorway morph
    const target = COLORS[appState.colorIndex]
    tmpA.set(target.hex)
    tmpB.set(target.accent)
    const shell = state.scene.getObjectByName('shell-mat') as THREE.MeshPhysicalMaterial | undefined
    const accent = state.scene.getObjectByName('accent-mat') as THREE.MeshStandardMaterial | undefined
    if (shell) shell.color.lerp(tmpA, 1 - Math.exp(-d * 6))
    if (accent) accent.color.lerp(tmpB, 1 - Math.exp(-d * 6))
  })

  /* materials */
  const shellMat = new THREE.MeshPhysicalMaterial({
    color: shellColor,
    roughness: 0.34,
    metalness: 0.18,
    clearcoat: 0.65,
    clearcoatRoughness: 0.28,
  })
  shellMat.name = 'shell-mat'

  const accentMat = new THREE.MeshStandardMaterial({
    color: accentColor,
    roughness: 0.35,
    metalness: 0.6,
    emissive: accentColor,
    emissiveIntensity: 0.35,
  })
  accentMat.name = 'accent-mat'

  const metalMat = new THREE.MeshStandardMaterial({ color: '#b9bcc4', roughness: 0.24, metalness: 1 })
  const cushionMat = new THREE.MeshStandardMaterial({ color: '#1c1e24', roughness: 0.95, metalness: 0 })

  const cupGeo = new THREE.CylinderGeometry(0.46, 0.5, 0.2, 64)
  const discGeo = new THREE.CylinderGeometry(0.33, 0.35, 0.045, 48)
  const logoGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.02, 32)
  const cushionGeo = new THREE.TorusGeometry(0.32, 0.115, 20, 48)
  const bandGeo = new THREE.TorusGeometry(1.04, 0.055, 24, 110, Math.PI)
  const padGeo = new THREE.TorusGeometry(0.95, 0.05, 16, 70, Math.PI * 0.5)
  const yokeGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.5, 20)

  return (
    <group ref={outer}>
      <group ref={inner}>
        {/* headband */}
        <mesh geometry={bandGeo} scale={[1, 1, 0.72]} material={shellMat} />
        <mesh geometry={padGeo} rotation={[0, 0, (Math.PI - Math.PI * 0.5) / 2]} scale={[1, 1, 0.8]} material={cushionMat} />

        {[-1, 1].map((sgn) => (
          <group key={sgn} position={[sgn * 1.04, -0.25, 0]}>
            {/* yoke */}
            <mesh geometry={yokeGeo} material={metalMat} />
            {/* ear cup */}
            <group position={[0, -0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
              <mesh geometry={cupGeo} material={shellMat} />
              <mesh geometry={discGeo} position={[sgn * 0.11, 0, 0]} material={metalMat} />
              <mesh geometry={logoGeo} position={[sgn * 0.14, 0, 0]} material={accentMat} />
              <mesh geometry={cushionGeo} rotation={[Math.PI / 2, 0, 0]} position={[-sgn * 0.09, 0, 0]} material={cushionMat} />
            </group>
          </group>
        ))}
      </group>
    </group>
  )
}

function Rig() {
  return (
    <>
      <color attach="background" args={['#07080a']} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 3]} intensity={1.5} color="#ffffff" />
      <directionalLight position={[-5, 2, -4]} intensity={0.5} color="#8ab4ff" />
      <spotLight position={[0, 5, 4]} angle={0.5} penumbra={1} intensity={0.8} color="#c9f24d" />

      <Headphones />

      <ContactShadows position={[0, -1.45, 0]} opacity={0.5} scale={9} blur={2.6} far={2.2} resolution={512} />

      <Environment resolution={256}>
        <Lightformer intensity={2.2} position={[0, 4, 2]} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer intensity={1.1} position={[-4, 1, -2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#8ab4ff" />
        <Lightformer intensity={0.9} position={[4, 0, -2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#c9f24d" />
        <Lightformer intensity={0.6} position={[0, -3, 1]} rotation-x={Math.PI / 2} scale={[8, 4, 1]} color="#666a73" />
      </Environment>
    </>
  )
}

export default function Scene() {
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 35, position: [0, 0, 5.6], near: 0.1, far: 50 }}
        gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      >
        <Rig />
      </Canvas>
    </div>
  )
}

export function usePointer() {
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      appState.pointerX = (e.clientX / window.innerWidth) * 2 - 1
      appState.pointerY = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])
}
