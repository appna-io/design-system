import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';

const result = await build({
  entryPoints: ['src/positioning/usePosition.ts', 'src/Portal.tsx', 'src/focus-trap/useFocusTrap.ts', 'src/focus-trap/FocusTrap.tsx', 'src/focus-trap/focusable.ts', 'src/escape-stack/useEscapeStack.ts', 'src/useOutsideClick.ts', 'src/useScrollLock.ts'],
  bundle: true,
  format: 'esm',
  target: 'es2022',
  external: ['react', 'react-dom', '@floating-ui/react'],
  write: false,
  minify: true,
  treeShaking: true,
});
let totalRaw = 0;
let totalGz = 0;
for (const out of result.outputFiles) {
  const raw = out.contents.byteLength;
  const gz = gzipSync(out.contents).byteLength;
  totalRaw += raw;
  totalGz += gz;
  console.log(out.path.split('/').slice(-2).join('/').padEnd(40), `${raw} B raw / ${gz} B gz`);
}
console.log('----');
console.log('TOTAL'.padEnd(40), `${totalRaw} B raw / ${totalGz} B gz`);
console.log(`(${(totalGz/1024).toFixed(2)} KB gz)`);
