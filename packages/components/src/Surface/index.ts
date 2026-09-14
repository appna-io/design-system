/**
 * `<Surface>` — the region primitive that establishes a ground for its subtree.
 *
 * No compound dot-namespace: Surface has no subparts. It wraps whatever you put in it and changes
 * what the tokens inside resolve to.
 */
export { Surface } from './Surface';
export { surfaceRecipe } from './Surface.recipe';
export {
  invertedPaletteVars,
  primaryPaletteVars,
  secondaryPaletteVars,
  surfaceCaptureVars,
  toneNeedsCapture,
  tonePaletteVars,
} from './Surface.tone';
export type { SurfaceProps, SurfaceTone } from './Surface.types';
export { SurfaceToneContext, useSurfaceTone, toneOwnsItsGround } from './SurfaceToneContext';
