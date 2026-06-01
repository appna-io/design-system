/**
 * Public surface for `<SplashProvider>` + `splash(…)` + `<SplashScreen>`.
 *
 * The trio splits responsibilities cleanly (mirrors Toast's `<Toaster>` + `toast()` +
 * `<Toast>` family):
 *
 *   `SplashProvider` — singleton root mounted once at the app shell.
 *   `splash`         — imperative facade callable from anywhere.
 *   `SplashScreen`   — declarative primitive for inline embeds / advanced declarative use.
 */
export { SplashProvider } from './SplashProvider';
export { SplashScreen } from './SplashScreen';
export { splash } from './splashApi';

// Lower-level building blocks. Power users may reach for these to compose custom hosts /
// tests / SSR snapshots.
export { SplashStore } from './SplashStore';
export { SplashSurface } from './SplashSurface';
export { useSplashState } from './useSplashState';
export {
  splashScreenRecipes,
  SPLASH_GRADIENT_BY_COLOR,
  SPLASH_PARTICLE_BREATHE_DELAYS_MS,
  SPLASH_PARTICLE_INNER_ANGLES,
  SPLASH_PARTICLE_OUTER_ANGLES,
  SPLASH_PULSE_RING_DELAYS_MS,
  SPLASH_WAVE_COLOR_CLASS,
} from './SplashScreen.recipe';

export type {
  SplashApi,
  SplashGradient,
  SplashProviderProps,
  SplashScreenBackdrop,
  SplashScreenColor,
  SplashScreenContextValue,
  SplashScreenIndicator,
  SplashScreenItem,
  SplashScreenPlacement,
  SplashScreenProps,
  SplashScreenVariant,
  SplashScreenVisualProps,
  SplashShowOptions,
} from './SplashScreen.types';

export type { SplashState } from './SplashStore';
export type { SplashSurfaceProps } from './SplashSurface';