import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { defineConfig } from 'tsup';

const USE_CLIENT = "'use client';\n";

function prependUseClient(file: string): void {
  const contents = readFileSync(file, 'utf8');
  if (contents.startsWith(USE_CLIENT)) return;
  writeFileSync(file, USE_CLIENT + contents);
}

export default defineConfig({
  entry: ['src/index.ts', 'src/tailwind-preset.ts'],
  format: ['esm', 'cjs'],
  dts: { resolve: true },
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  target: 'es2022',
  external: ['react', 'react-dom', 'motion', 'motion/react'],
  noExternal: [/^@apx-ui\//],
  async onSuccess() {
    const src = '../theme/src/styles/reset.css';
    const dest = 'dist/styles/reset.css';
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(src, dest);
    // Mark the aggregated runtime as client-only (tailwind-preset stays pure data).
    prependUseClient('dist/index.js');
    prependUseClient('dist/index.cjs');
  },
});