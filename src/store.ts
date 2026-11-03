/* Tiny module-level app state shared between UI and the 3D scene.
   The 3D loop reads these values every frame (no re-renders needed).
   UI pieces that need to react to a change subscribe via `subscribe`. */
type Listener = () => void

export const appState = {
  scroll: 0,
  colorIndex: 0,
  pointerX: 0,
  pointerY: 0,
  ready: false,
  /** 0 = closed, 1 = fully opened (the cutaway) */
  open: 0,
  /** id of the part the visitor is inspecting */
  selectedPart: null as string | null,

  listeners: new Set<Listener>(),

  subscribe(fn: Listener) {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  },

  /* single source of truth for the selected finish */
  setColor(i: number) {
    if (i === this.colorIndex) return
    this.colorIndex = i
    this.listeners.forEach((fn) => fn())
  },

  setOpen(v: number) {
    this.open = v
  },

  setSelectedPart(id: string | null) {
    if (id === this.selectedPart) return
    this.selectedPart = id
    this.listeners.forEach((fn) => fn())
  },
}

export const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const FINE_POINTER =
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches
