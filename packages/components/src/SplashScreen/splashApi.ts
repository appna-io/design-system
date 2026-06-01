import { SplashStore } from './SplashStore';
import type {
  SplashApi,
  SplashScreenVariant,
  SplashShowOptions,
} from './SplashScreen.types';

/**
 * Public imperative facade. Mirrors `toast(…)` from the Toast component family.
 *
 * The shape is intentionally `Object.assign(callable, { …aliases })` rather than a class so
 * tree-shaking can drop unused aliases (a consumer that only calls `splash.pulse` won't pay
 * for `splash.gradient`, etc.).
 *
 * @example
 *   // Anywhere in the app — a fetch interceptor, a click handler, an async action:
 *   import { splash } from '@apx-ui/ds';
 *
 *   const id = splash({
 *     logo: <MyLogo />,
 *     title: 'Loading workspace…',
 *     showProgress: true,
 *     progress: 0,
 *   });
 *
 *   for await (const chunk of upload()) {
 *     splash.update(id, { progress: chunk.percent });
 *   }
 *
 *   splash.hide(id);
 */
function baseShow(options: SplashShowOptions = {}): string {
  return SplashStore.show(options);
}

function withVariant(variant: SplashScreenVariant) {
  return (options: Omit<SplashShowOptions, 'variant'> = {}): string =>
    SplashStore.show({ ...options, variant });
}

export const splash: SplashApi = Object.assign(baseShow, {
  show: baseShow,
  fade: withVariant('fade'),
  pulse: withVariant('pulse'),
  gradient: withVariant('gradient'),
  particles: withVariant('particles'),
  wave: withVariant('wave'),
  hide: (id?: string): void => SplashStore.hide(id),
  update: (id: string, patch: Partial<SplashShowOptions>): void =>
    SplashStore.update(id, patch),
  isActive: (id?: string): boolean => SplashStore.isActive(id),
});