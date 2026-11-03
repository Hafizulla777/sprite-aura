import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Lightformer, ContactShadows, RoundedBox } from '@react-three/drei'
import * as THREE from 'three'
import { appState } from '../store'
import { COLORS } from '../data/product'

/* ------------------------------------------------------------------ *
 *  AURA ONE — a real product model, not a placeholder.
 *
 *  The headphone is built from lathed profiles, a swept headband and
 *  proper cushion tori, so it holds up close. The right and left cups
 *  separate along their axis to reveal the driver stack, and the whole
 *  unit turns once on the way into the cutaway.
 * ------------------------------------------------------------------ */

/* scroll keyframes: one pose per section */
type Pose = { pos: [number, number, number]; rotY: number; rotX: number; scale: number }
const POSES: Pose[] = [
  { pos: [1.15, 0.08, 0.1], rotY: -0.5, rotX: 0.12, scale: 1.0 }, // hero
  { pos: [1.3, 0.0, -0.25], rotY: 0.75, rotX: 0.05, scale: 0.94 }, // features
  { pos: [0.72, 0.02, 0.15], rotY: 0.0, rotX: 0.02, scale: 0.9 }, // anatomy (opened)
  { pos: [-1.25, 0.0, 0.1], rotY: -1.1, rotX: 0.06, scale: 1.02 }, // specs
  { pos: [0.0, 0.0, 0.45], rotY: 0.22, rotX: 0.0, scale: 1.14 }, // colors
  { pos: [0.0, 0.12, -0.55], rotY: -0.38, rotX: 0.08, scale: 0.86 }, // cta
]

/* how far each part travels when the headphone opens (local X of the cup) */
const OPEN: Record<string, [number, number, number]> = {
  shell: [0.5, 0, 0],
  plate: [0.5, 0, 0],
  ring: [0.52, 0, 0],
  cushion: [-0.54, 0, 0],
  grille: [-0.44, 0, 0],
  diaphragm: [-0.36, 0, 0],
  magnet: [-0.26, 0, 0],
  basket: [-0.14, 0, 0],
  battery: [0.26, 0.28, 0],
  mic: [0.42, 0, 0],
  tracker: [0.34, -0.18, 0],
  yoke: [0, 0.34, 0],
  band: [0, 0.5, 0],
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const smoothstep = (x: number) => x * x * (3 - 2 * x)
const damp = (current: number, target: number, dt: number, rate: number) =>
  current + (target - current) * (1 - Math.exp(-dt * rate))

/* ---------- geometry ---------- */
function lathe(points: [number, number][], segments = 72) {
  const g = new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segments,
  )
  g.rotateZ(-Math.PI / 2) // lathe axis (Y) -> +X
  g.computeVertexNormals()
  return g
}

const SHELL_PROFILE: [number, number][] = [
  [0, -0.1],
  [0.18, -0.098],
  [0.33, -0.088],
  [0.43, -0.066],
  [0.485, -0.032],
  [0.5, 0.004],
  [0.492, 0.038],
  [0.455, 0.064],
  [0.38, 0.082],
  [0.25, 0.094],
  [0.1, 0.1],
  [0, 0.102],
]

const PLATE_PROFILE: [number, number][] = [
  [0, 0.0],
  [0.16, 0.002],
  [0.26, 0.01],
  [0.31, 0.026],
  [0.325, 0.042],
  [0.31, 0.056],
  [0.26, 0.068],
  [0.14, 0.074],
  [0, 0.076],
]

const DRIVER_PROFILE: [number, number][] = [
  [0, 0.0],
  [0.06, 0.006],
  [0.12, 0.018],
  [0.2, 0.04],
  [0.27, 0.072],
  [0.31, 0.105],
  [0.33, 0.132],
  [0.335, 0.146],
]

function useGeometries() {
  return useMemo(() => {
    const bandCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-1.0, 0.5, 0),
      new THREE.Vector3(-0.72, 0.92, 0),
      new THREE.Vector3(0, 1.12, 0),
      new THREE.Vector3(0.72, 0.92, 0),
      new THREE.Vector3(1.0, 0.5, 0),
    ])
    const band = new THREE.TubeGeometry(bandCurve, 96, 0.075, 14, false)
    band.scale(1, 1, 0.62)
    band.computeVertexNormals()

    const padCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.86, 0.56, 0),
      new THREE.Vector3(-0.64, 0.9, 0),
      new THREE.Vector3(0, 1.06, 0),
      new THREE.Vector3(0.64, 0.9, 0),
      new THREE.Vector3(0.86, 0.56, 0),
    ])
    const pad = new THREE.TubeGeometry(padCurve, 80, 0.052, 12, false)
    pad.scale(1, 1, 0.85)
    pad.computeVertexNormals()

    const cushion = new THREE.TorusGeometry(0.3, 0.105, 20, 56)
    cushion.rotateY(Math.PI / 2)
    cushion.scale(0.82, 1.05, 1.05)
    cushion.computeVertexNormals()

    const ring = new THREE.TorusGeometry(0.2, 0.016, 12, 48)
    ring.rotateY(Math.PI / 2)

    const magnet = new THREE.TorusGeometry(0.16, 0.052, 14, 40)
    magnet.rotateY(Math.PI / 2)

    const yoke = new THREE.CapsuleGeometry(0.028, 0.3, 6, 14)
    yoke.rotateZ(Math.PI / 2)

    return {
      band,
      pad,
      cushion,
      ring,
      magnet,
      yoke,
      shell: lathe(SHELL_PROFILE),
      plate: lathe(PLATE_PROFILE),
      basket: lathe(DRIVER_PROFILE, 48),
      diaphragm: lathe(
        [
          [0, 0],
          [0.05, 0.012],
          [0.12, 0.03],
          [0.2, 0.046],
          [0.27, 0.056],
          [0.3, 0.06],
        ],
        48,
      ),
      grille: lathe(
        [
          [0, 0],
          [0.14, 0.002],
          [0.24, 0.008],
          [0.3, 0.02],
          [0.31, 0.03],
        ],
        48,
      ),
    }
  }, [])
}

type Materials = {
  shell: THREE.MeshPhysicalMaterial
  plate: THREE.MeshStandardMaterial
  metal: THREE.MeshStandardMaterial
  cushion: THREE.MeshStandardMaterial
  accent: THREE.MeshStandardMaterial
  internals: THREE.MeshStandardMaterial
  magnet: THREE.MeshStandardMaterial
  membrane: THREE.MeshStandardMaterial
  grille: THREE.MeshStandardMaterial
}

function useMaterials() {
  return useMemo(() => {
    const shell = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(COLORS[0].hex),
      roughness: 0.3,
      metalness: 0.35,
      clearcoat: 0.75,
      clearcoatRoughness: 0.22,
    })
    const plate = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a1d23'),
      roughness: 0.34,
      metalness: 0.85,
    })
    const metal = new THREE.MeshStandardMaterial({ color: '#c3c7cf', roughness: 0.22, metalness: 1 })
    const cushion = new THREE.MeshStandardMaterial({ color: '#15171b', roughness: 0.96, metalness: 0 })
    const accent = new THREE.MeshStandardMaterial({
      color: new THREE.Color(COLORS[0].accent),
      roughness: 0.4,
      metalness: 0.5,
      emissive: new THREE.Color(COLORS[0].accent),
      emissiveIntensity: 0.4,
    })
    const internals = new THREE.MeshStandardMaterial({ color: '#3c424c', roughness: 0.42, metalness: 0.9 })
    const magnet = new THREE.MeshStandardMaterial({ color: '#8d6a4c', roughness: 0.45, metalness: 0.9 })
    const membrane = new THREE.MeshStandardMaterial({
      color: '#8b929c',
      roughness: 0.35,
      metalness: 0.6,
      side: THREE.DoubleSide,
    })
    const grille = new THREE.MeshStandardMaterial({
      color: '#0d0f12',
      roughness: 0.85,
      metalness: 0.2,
      side: THREE.DoubleSide,
    })
    return { shell, plate, metal, cushion, accent, internals, magnet, membrane, grille }
  }, [])
}

/* ------------------------------------------------------------------ *
 *  One ear cup. `side` is +1 (right) or -1 (left); the left cup is
 *  mirrored so both open symmetrically.
 * ------------------------------------------------------------------ */
function Cup({
  side,
  geo,
  mat,
  parts,
}: {
  side: 1 | -1
  geo: ReturnType<typeof useGeometries>
  mat: Materials
  parts: Record<string, THREE.Object3D | null>
}) {
  const set = (id: string) => (o: THREE.Object3D | null) => {
    parts[id] = o
  }

  return (
    <group position={[side * 1.0, -0.18, 0]} rotation={[0, side === 1 ? 0 : Math.PI, 0]}>
      {/* the shell and its plate */}
      <group ref={set('shell')}>
        <mesh geometry={geo.shell} material={mat.shell} castShadow receiveShadow />
      </group>
      <group ref={set('plate')} position={[0.085, 0, 0]}>
        <mesh geometry={geo.plate} material={mat.plate} castShadow />
      </group>
      <group ref={set('ring')} position={[0.15, 0, 0]}>
        <mesh geometry={geo.ring} material={mat.metal} />
        <mesh geometry={geo.ring} material={mat.accent} scale={0.72} position={[0.004, 0, 0]} />
      </group>

      {/* ear cushion */}
      <group ref={set('cushion')} position={[-0.24, 0, 0]}>
        <mesh geometry={geo.cushion} material={mat.cushion} castShadow />
      </group>

      {/* internals */}
      <group ref={set('basket')} position={[-0.02, 0, 0]}>
        <mesh geometry={geo.basket} material={mat.internals} />
      </group>
      <group ref={set('magnet')} position={[-0.09, 0, 0]}>
        <mesh geometry={geo.magnet} material={mat.magnet} />
        <mesh position={[0.06, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.075, 0.075, 0.1, 24]} />
          <primitive object={mat.internals} attach="material" />
        </mesh>
      </group>
      <group ref={set('diaphragm')} position={[-0.15, 0, 0]}>
        <mesh geometry={geo.diaphragm} material={mat.membrane} />
      </group>
      <group ref={set('grille')} position={[-0.2, 0, 0]}>
        <mesh geometry={geo.grille} material={mat.grille} />
      </group>

      {/* battery + anc microphones + head tracker */}
      <group ref={set('battery')} position={[0.0, 0.36, 0]}>
        <RoundedBox args={[0.3, 0.12, 0.16]} radius={0.03} smoothness={3} castShadow>
          <primitive object={mat.internals} attach="material" />
        </RoundedBox>
      </group>
      <group ref={set('mic')} position={[0.1, 0, 0.2]}>
        {[-0.16, 0, 0.16].map((z) => (
          <mesh key={z} position={[0, 0, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.022, 0.022, 0.03, 12]} />
            <primitive object={mat.metal} attach="material" />
          </mesh>
        ))}
      </group>
      <group ref={set('tracker')} position={[0.02, -0.34, 0.12]}>
        <RoundedBox args={[0.16, 0.05, 0.1]} radius={0.012} smoothness={2}>
          <primitive object={mat.plate} attach="material" />
        </RoundedBox>
      </group>
    </group>
  )
}

function Headphone() {
  const root = useRef<THREE.Group>(null)
  const tilt = useRef<THREE.Group>(null)
  const parts = useRef<{
    L: Record<string, THREE.Object3D | null>
    R: Record<string, THREE.Object3D | null>
  }>({ L: {}, R: {} })
  const geo = useGeometries()
  const mat = useMaterials()
  const state = useRef({ turn: 0, open: 0 })

  useEffect(() => {
    return () => {
      Object.values(geo).forEach((g) => (g as THREE.BufferGeometry).dispose())
      Object.values(mat).forEach((m) => m.dispose())
    }
  }, [geo, mat])

  useFrame((st, dt) => {
    const d = Math.min(dt, 0.05)
    const max = document.documentElement.scrollHeight - window.innerHeight
    const p = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0

    const seg = p * (POSES.length - 1)
    const i = Math.min(Math.floor(seg), POSES.length - 2)
    const f = smoothstep(seg - i)
    const a = POSES[i]
    const b = POSES[i + 1]

    const pos: [number, number, number] = [
      lerp(a.pos[0], b.pos[0], f),
      lerp(a.pos[1], b.pos[1], f),
      lerp(a.pos[2], b.pos[2], f),
    ]
    const rotY = lerp(a.rotY, b.rotY, f)
    const rotX = lerp(a.rotX, b.rotX, f)
    const scale = lerp(a.scale, b.scale, f)

    /* one full revolution on the way into the cutaway */
    const section = document.getElementById('anatomy')
    let turnTarget = 0
    if (section) {
      const top = section.getBoundingClientRect().top
      const vh = window.innerHeight
      turnTarget = 1 - Math.min(Math.max((top - vh * 0.4) / (vh * 0.6), 0), 1)
    }
    state.current.turn = damp(state.current.turn, turnTarget, d, 6)
    state.current.open = damp(state.current.open, appState.open, d, 7)

    const w = st.size.width
    const narrow = w < 768
    const g = root.current
    if (g) {
      const px = narrow ? pos[0] * 0.12 : pos[0]
      const py = narrow ? pos[1] + 0.3 : pos[1]
      g.position.set(px, py, pos[2])
      g.rotation.y = rotY + state.current.turn * Math.PI * 2
      g.rotation.x = rotX
      const s = (narrow ? scale * 0.62 : w < 1100 ? scale * 0.82 : scale) * (1 + 0.12 * Math.sin(state.current.turn * Math.PI))
      g.scale.setScalar(s)
    }

    /* pointer parallax */
    const n = tilt.current
    if (n) {
      n.position.y = Math.sin(st.clock.elapsedTime * 0.8) * 0.022
      n.rotation.y = THREE.MathUtils.lerp(n.rotation.y, Math.sin(st.clock.elapsedTime * 0.5) * 0.06 + appState.pointerX * 0.2, 0.06)
      n.rotation.x = THREE.MathUtils.lerp(n.rotation.x, -appState.pointerY * 0.12, 0.06)
    }

    /* the teardown: every part slides out along the cup axis. The left cup is
       mirrored by its own rotation, so both sides share the same offsets. */
    const open = state.current.open
    const selected = appState.selectedPart
    const sides: Record<string, THREE.Object3D | null>[] = [parts.current.R, parts.current.L]
    for (const map of sides) {
      for (const [id, target] of Object.entries(OPEN)) {
        const obj = map[id]
        if (!obj) continue
        const base = obj.userData.base ?? (obj.userData.base = obj.position.clone())
        const off = new THREE.Vector3(target[0], target[1], target[2])
        const want = base.clone().addScaledVector(off, open)
        obj.position.lerp(want, 1 - Math.exp(-d * 8))
      }
    }

    /* the headband lifts clear of the cups when it opens */

    /* finish colour */
    const target = COLORS[appState.colorIndex] ?? COLORS[0]
    tmpA.set(target.hex)
    tmpB.set(target.accent)
    const k = 1 - Math.exp(-d * 6)
    mat.shell.color.lerp(tmpA, k)
    mat.accent.color.lerp(tmpB, k)
    mat.accent.emissive.lerp(tmpB, k)

    /* selected part glows, the rest dim */
    mat.shell.emissiveIntensity = damp(mat.shell.emissiveIntensity, selected === 'shell' ? 0.35 : 0, d, 8)
    mat.shell.emissive.lerp(tmpA, k)
    mat.metal.emissiveIntensity = damp(mat.metal.emissiveIntensity, selected === 'ring' || selected === 'mic' ? 0.6 : 0, d, 8)
    mat.cushion.emissiveIntensity = damp(mat.cushion.emissiveIntensity, selected === 'cushion' ? 0.4 : 0, d, 8)
    mat.internals.emissiveIntensity = damp(
      mat.internals.emissiveIntensity,
      selected === 'basket' || selected === 'battery' || selected === 'tracker' ? 0.5 : 0,
      d,
      8,
    )
    mat.magnet.emissiveIntensity = damp(mat.magnet.emissiveIntensity, selected === 'magnet' ? 0.6 : 0, d, 8)
    mat.membrane.emissiveIntensity = damp(mat.membrane.emissiveIntensity, selected === 'diaphragm' ? 0.6 : 0, d, 8)
    mat.grille.emissiveIntensity = damp(mat.grille.emissiveIntensity, selected === 'grille' ? 0.6 : 0, d, 8)
  })

  return (
    <group ref={root}>
      <group ref={tilt}>
        <group
          ref={(o) => {
            parts.current.R.band = o
          }}
        >
          <mesh geometry={geo.band} material={mat.shell} castShadow receiveShadow />
          <mesh geometry={geo.pad} material={mat.cushion} castShadow />
        </group>
        {/* yokes */}
        {([-1, 1] as const).map((s) => (
          <group
            key={s}
            position={[s * 1.0, 0.4, 0]}
            ref={(o) => {
              parts.current[s === 1 ? 'R' : 'L'].yoke = o
            }}
          >
            <mesh geometry={geo.yoke} material={mat.metal} scale={[1, 1, 1]} />
            <mesh position={[0, -0.16, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.05, 18]} />
              <primitive object={mat.metal} attach="material" />
            </mesh>
          </group>
        ))}
        <Cup side={-1} geo={geo} mat={mat} parts={parts.current.L} />
        <Cup side={1} geo={geo} mat={mat} parts={parts.current.R} />
      </group>
    </group>
  )
}

const tmpA = new THREE.Color()
const tmpB = new THREE.Color()

function Rig() {
  return (
    <>
      <color attach="background" args={['#07080a']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 3]} intensity={2.1} color="#ffffff" />
      <directionalLight position={[-5, 2, -4]} intensity={0.8} color="#8ab4ff" />
      <spotLight position={[0, 5, 4]} angle={0.5} penumbra={1} intensity={1.1} color="#c9f24d" />
      <pointLight position={[0, -1.5, 2]} intensity={0.5} color="#ffffff" />

      <Headphone />

      <ContactShadows position={[0, -1.1, 0]} opacity={0.45} scale={9} blur={2.6} far={2.2} resolution={512} />

      <Environment resolution={256}>
        <Lightformer intensity={2.6} position={[0, 4, 2]} scale={[8, 3, 1]} color="#ffffff" />
        <Lightformer intensity={1.3} position={[-4, 1, -2]} rotation-y={Math.PI / 2} scale={[6, 2, 1]} color="#8ab4ff" />
        <Lightformer intensity={1.1} position={[4, 0, -2]} rotation-y={-Math.PI / 2} scale={[6, 2, 1]} color="#c9f24d" />
        <Lightformer intensity={0.7} position={[0, -3, 1]} rotation-x={Math.PI / 2} scale={[8, 4, 1]} color="#666a73" />
      </Environment>
    </>
  )
}

export default function Scene() {
  return (
    <div className="canvas-wrap" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ fov: 32, position: [0.4, 0.2, 4.6], near: 0.1, far: 60 }}
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
