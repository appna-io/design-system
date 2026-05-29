import type { Config } from 'tailwindcss';
import { apxTailwindPreset } from 'apx-ds/tailwind-preset';

const config: Config = {
  presets: [apxTailwindPreset as unknown as Config],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    '../../packages/components/src/**/*.{ts,tsx,md,mdx}',
    '../../packages/apx-ds/dist/**/*.{js,cjs}',
  ],
  plugins: [],
};

export default config;
