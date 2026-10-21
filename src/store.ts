/* Tiny module-level app state shared between UI and the 3D scene.
   The 3D loop reads these values every frame (no re-renders needed). */
export const appState = {
  scroll: 0,
  colorIndex: 0,
  pointerX: 0,
  pointerY: 0,
  ready: false,
}

export const REDUCED_MOTION =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

export const FINE_POINTER =
  typeof window !== 'undefined' &&
  window.matchMedia('(pointer: fine)').matches
