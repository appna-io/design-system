import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'splash-screen',
  displayName: 'SplashScreen',
  description:
    "Imperative full-screen splash. Call `splash.show({ ... })` from anywhere to overlay the viewport — powered by `<SplashProvider>`, the singleton host mounted once at the app root (mirrors `Toaster` + `toast()`). Five animated variants (fade / pulse / gradient / particles / wave), optional logo / title / subtitle / footer, opt-in Spinner or Progress indicator, auto-dismiss timeout, and `splash.update(id, patch)` for in-place updates (e.g. driving a progress bar). Pure CSS animations, prefers-reduced-motion aware.",
  category: 'Feedback',
  tags: [
    'splash',
    'splash-screen',
    'imperative',
    'provider',
    'loading',
    'first-paint',
    'logo',
    'spinner',
    'progress',
    'brand',
    'intro',
  ],
};