#!/usr/bin/env node
/**
 * Pagination bundle-size measurement script.
 *
 * Two views matter:
 *
 *   1. **Bare-minimum consumer** — `import { Pagination } from 'apx-ds'`.
 *      The default consumption shape.
 *
 *   2. **Full-surface consumer** — every named export from the Pagination
 *      barrel (recipes, helpers, hooks, all locale bundles).
 *
 * We externalize React, motion, lucide, the DS engine + theme + tokens
 * packages, and every sibling DS component — those are paid for once by any
 * DS consumer, so they don't count toward the Pagination delta.
 *
 * `<Select>` is **NOT** externalized when measuring the "with size picker"
 * surface, because Select is part of the rendered Pagination tree by default
 * — the plan budget calls it out as the one peer that counts (and the
 * `hidePageSize` shape exists for consumers who want to opt out).
 */

import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const require_ = createRequire(import.meta.url);

function resolveEsbuild() {
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
const TMP = path.join(PKG, '.pagination-size-tmp.mjs');

const EXTERNAL = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'motion',
  'motion/react',
  'lucide-react',
  '@apx-ui/engine',
  '@apx-ui/theme',
  '@apx-ui/tokens',
];

// Sibling DS components — when measuring Pagination alone, treat anything in
// the shared components package that Pagination composes as already paid-for
// by a DS consumer. Note that `Select` is in this list — the plan budget
// explicitly excludes Select, since it's already in any DS consumer's bundle
// for form-field UX.
const SIBLINGS = new Set([
  'Accordion',
  'Alert',
  'AppShell',
  'Avatar',
  'Badge',
  'Breadcrumbs',
  'Button',
  'Calendar',
  'Card',
  'Carousel',
  'Checkbox',
  'ColorPicker',
  'Combobox',
  'CommandPalette',
  'DataGrid',
  'DatePicker',
  'Divider',
  'Div',
  'Drawer',
  'EmptyState',
  'Field',
  'FileUpload',
  'Form',
  'HoverCard',
  'HStack',
  'Icon',
  'Input',
  'Menu',
  'Modal',
  'NavigationMenu',
  'NumberInput',
  'Popover',
  'Progress',
  'Radio',
  'Rating',
  'Select',
  'Sidebar',
  'Skeleton',
  'Slider',
  'Spacer',
  'Spinner',
  'Stack',
  'Stat',
  'Stepper',
  'Switch',
  'Table',
  'Tabs',
  'TagsInput',
  'Text',
  'Textarea',
  'Timeline',
  'Toast',
  'Toggle',
  'Toolbar',
  'Tooltip',
  'TreeView',
  'Typography',
  'VStack',
  '_shared',
]);

const externalSiblingsPlugin = {
  name: 'external-ds-siblings',
  setup(b) {
    b.onResolve({ filter: /^(?:\.\.\/){1,3}[A-Z_]/ }, (args) => {
      const segments = args.path.split('/');
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

console.log('Pagination bundle delta — peer deps + engine + DS siblings (incl. Select) externalized\n');

await measure(
  'minimal — Pagination only',
  'export { Pagination } from "./src/Pagination";',
);
await measure(
  'minimal + usePagination + en bundle',
  'export { Pagination, usePagination, enPaginationTranslations } from "./src/Pagination";',
);
await measure(
  'minimal + he + ar locales',
  'export { Pagination, usePagination, enPaginationTranslations, hePaginationTranslations, arPaginationTranslations } from "./src/Pagination";',
);
const full = await measure(
  'full surface — every export',
  'export * from "./src/Pagination";',
);

console.log('\nTop 10 contributors to the full-surface bundle:');
const totals = new Map();
for (const out of Object.values(full.metafile.outputs)) {
  for (const [file, info] of Object.entries(out.inputs)) {
    const m = file.match(/src\/Pagination\/([^/]+)(?:\/|$)([^/]+)?/);
    let key = file;
    if (m) {
      if (['i18n', 'examples'].includes(m[1])) {
        key = `${m[1]}/${m[2] ?? ''}`;
      } else {
        key = m[1];
      }
    }
    totals.set(key, (totals.get(key) ?? 0) + info.bytesInOutput);
  }
}
const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
for (const [k, v] of ranked) {
  console.log(`  ${k.padEnd(50)} ${(v / 1024).toFixed(2).padStart(8)} KB`);
}
