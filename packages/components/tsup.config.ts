import { readFileSync, writeFileSync } from 'node:fs';
import { defineConfig } from 'tsup';

const USE_CLIENT = "'use client';\n";

function prependUseClient(file: string): void {
  const contents = readFileSync(file, 'utf8');
  if (contents.startsWith(USE_CLIENT)) return;
  writeFileSync(file, USE_CLIENT + contents);
}

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  target: 'es2022',
  external: ['react', 'react-dom', '@apx-ui/engine', '@apx-ui/theme', '@apx-ui/tokens'],
  async onSuccess() {
    prependUseClient('dist/index.js');
    prependUseClient('dist/index.cjs');
  },
});