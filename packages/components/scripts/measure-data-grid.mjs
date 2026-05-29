#!/usr/bin/env node
/**
 * DataGrid bundle-size measurement script.
 *
 * Two views matter:
 *
 *   1. **Bare-minimum consumer** — `import { DataGrid } from 'apx-ds'`.
 *      This is what 95 % of consumers ship. It exercises tree-shaking.
 *
 *   2. **Full-surface consumer** — `import * from 'apx-dsaGrid'`.
 *      The worst case: every subpart + every helper. Useful for tracking the
 *      total exported surface.
 *
 * We externalize React, motion, lucide, the optional virtualization peer dep,
 * and the DS engine + theme + tokens packages — those are paid for once by any
 * DS consumer, so they don't count toward the DataGrid delta.
 */

import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const require_ = createRequire(import.meta.url);

// esbuild is pulled in transitively by tsup / vitest; resolve it through the
// workspace store rather than depending on it directly in this package.
function resolveEsbuild() {
  // Walk up to the workspace root, then look for esbuild under .pnpm.
  let dir = path.dirname(fileURLToPath(import.meta.url));
  while (dir !== '/' && !fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
    dir = path.dirname(dir);
  }
  const store = path.join(dir, 'node_modules', '.pnpm');
  const found = execSync(`find ${store} -maxdepth 3 -name esbuild -type d`, {
    encoding: 'utf8',
  })
    .trim()
    .split('\n')
    .filter(Boolean);
  if (found.length === 0) throw new Error(`esbuild not found in ${store}`);
  return found[0];
}

const esbuild = require_(resolveEsbuild());

const PKG = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const TMP = path.join(PKG, '.size-tmp.mjs');

const EXTERNAL = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'motion',
  'motion/react',
  'lucide-react',
  '@tanstack/react-virtual',
  '@apx-ui/engine',
  '@apx-ui/theme',
  '@apx-ui/tokens',
];

// Sibling DS components — when measuring DataGrid alone, treat anything in the
// shared component package that DataGrid composes as already paid-for by a DS
// consumer (Menu, Popover, Select, Button, Checkbox, EmptyState, Field, …).
const SIBLINGS = new Set([
  'Popover',
  'Menu',
  'Select',
  'Checkbox',
  'Button',
  'EmptyState',
  'Field',
  'Skeleton',
  'Alert',
  'Input',
  'Switch',
  'Radio',
  'Badge',
  'Avatar',
  'Card',
  'Tabs',
  'Tooltip',
  'Modal',
  'Drawer',
  'Toast',
  'Accordion',
  'Toolbar',
  'TreeView',
  'Table',
  'Calendar',
  'Combobox',
  'TagsInput',
  'ColorPicker',
  'Form',
  'Sidebar',
  'NavigationMenu',
  'HoverCard',
  'Slider',
  'NumberInput',
  'Toggle',
  'Pagination',
  'Breadcrumbs',
  'FileUpload',
  'Stat',
  'Stepper',
  'Stack',
  'Divider',
  'Spinner',
  'Rating',
  'Carousel',
  'Icon',
  'Timeline',
  'Progress',
  'CommandPalette',
  'DatePicker',
  'AppShell',
  'HStack',
  'VStack',
  'Spacer',
  'Div',
  'Text',
  'Typography',
  'Textarea',
  '_shared',
]);

const externalSiblingsPlugin = {
  name: 'external-ds-siblings',
  setup(b) {
    // DataGrid sources reach siblings via either `../Sibling` (top-level files)
    // or `../../Sibling` (files under DataGrid/parts/). Match both.
    b.onResolve({ filter: /^(?:\.\.\/){1,3}[A-Z_]/ }, (args) => {
      const segments = args.path.split('/');
      // Find the first segment that isn't `..` — that's the sibling component name.
      const top = segments.find((s) => s !== '..' && s !== '.');
      if (top && SIBLINGS.has(top)) {
        return { path: args.path, external: true };
      }
      return undefined;
    });
  },
};

async function measure(label, entry) {
  fs.writeFileSync(TMP, entry);
  const result = await esbuild.build({
    entryPoints: [TMP],
    bundle: true,
    minify: true,
    format: 'esm',
    target: 'es2020',
    write: false,
    external: EXTERNAL,
    plugins: [externalSiblingsPlugin],
    metafile: true,
    logLevel: 'silent',
  });
  fs.unlinkSync(TMP);
  const raw = Buffer.concat(result.outputFiles.map((f) => Buffer.from(f.contents)));
  const gz = zlib.gzipSync(raw, { level: 9 });
  console.log(
    `${label.padEnd(60)} raw ${(raw.length / 1024).toFixed(2).padStart(8)} KB  ·  gz ${(gz.length / 1024).toFixed(2).padStart(7)} KB`,
  );
  return { raw: raw.length, gz: gz.length, metafile: result.metafile };
}

console.log('DataGrid bundle delta — peer deps + engine + DS siblings externalized\n');

await measure('minimal — DataGrid only', 'export { DataGrid } from "./src/DataGrid";');
await measure(
  'minimal — DataGrid + useDataGrid + en bundle',
  'export { DataGrid, useDataGrid, enDataGridTranslations } from "./src/DataGrid";',
);
await measure(
  'minimal + he + ar locales',
  'export { DataGrid, useDataGrid, enDataGridTranslations, heDataGridTranslations, arDataGridTranslations } from "./src/DataGrid";',
);
const full = await measure(
  'full surface — every export',
  'export * from "./src/DataGrid";',
);

console.log('\nTop 15 contributors to the full-surface bundle:');
const totals = new Map();
for (const out of Object.values(full.metafile.outputs)) {
  for (const [file, info] of Object.entries(out.inputs)) {
    const m = file.match(/src\/DataGrid\/([^/]+)(?:\/|$)([^/]+)?/);
    let key = file;
    if (m) {
      if (['headless', 'parts', 'i18n', 'examples'].includes(m[1])) {
        key = `${m[1]}/${m[2] ?? ''}`;
      } else {
        key = m[1];
      }
    }
    totals.set(key, (totals.get(key) ?? 0) + info.bytesInOutput);
  }
}
const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15);
for (const [k, v] of ranked) {
  console.log(`  ${k.padEnd(50)} ${(v / 1024).toFixed(2).padStart(8)} KB`);
}
