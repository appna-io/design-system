import type { Config } from 'tailwindcss';
import { apxTailwindPreset } from '@apx-ui/ds/tailwind-preset';

const config: Config = {
  // Wraps every `hover:` utility in `@media (hover: hover)`. On touch, `:hover` latches after a
  // tap and never releases, so without this a tapped card stays lifted for the rest of the
  // session. Has to live here rather than in the preset — Tailwind's `resolveConfig` does not
  // merge `future` from presets (measured: 0 guarded rules from the preset, 102 from here).
  future: { hoverOnlyWhenSupported: true },
  presets: [apxTailwindPreset as unknown as Config],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    '../../packages/components/src/**/*.{ts,tsx,md,mdx}',
    '../../packages/apx-ds/dist/**/*.{js,cjs}',
  ],
  plugins: [],
};

export default config;