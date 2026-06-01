import 'server-only';

import type { Dirent } from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { cache } from 'react';

import { componentsSrcDir } from './paths';
import { toKebab } from './slug';

/** Per-component metadata loaded from each `<Component>/meta.ts` file. */
export interface ComponentMetaShape {
  name: string;
  displayName: string;
  description?: string | undefined;
  category?: string | undefined;
  tags?: readonly string[] | undefined;
}

export interface ExampleSource {
  /** File name without extension, e.g. `Basic`. */
  id: string;
  /** Path relative to `packages/components/src/<Component>/examples/`. */
  file: string;
  /** Raw source text used for the CodeBlock. */
  source: string;
}

export interface ComponentEntry {
  slug: string;
  dirName: string;
  meta: ComponentMetaShape;
  /** Raw README content (`.mdx` preferred, falls back to `.md`). May be empty if neither exists. */
  readme: string;
  readmeFormat: 'mdx' | 'md' | 'none';
  examples: ExampleSource[];
  /** Source of the main implementation file (used by the props-table extractor). */
  sourcePath: string;
}

const VALID_EXAMPLE_EXTENSIONS = new Set(['.tsx', '.jsx']);

async function safeReadFile(file: string): Promise<string | null> {
  try {
    return await fsp.readFile(file, 'utf8');
  } catch {
    return null;
  }
}

async function loadMeta(dirName: string, componentDir: string): Promise<ComponentMetaShape> {
  const metaPath = path.join(componentDir, 'meta.ts');
  const text = await safeReadFile(metaPath);
  if (!text) {
    return { name: toKebab(dirName), displayName: dirName };
  }
  // Lightweight parse: we only need a handful of literal fields. Avoiding a TS evaluator keeps
  // the renderer simple and lets meta.ts stay a real, type-checked module for authors.
  const get = (key: string): string | undefined => {
    const match = text.match(new RegExp(`${key}\\s*:\\s*['"\`]([^'"\`]+)['"\`]`));
    return match?.[1];
  };
  const tagsMatch = text.match(/tags\s*:\s*\[([^\]]*)\]/);
  const tags = tagsMatch?.[1]
    ?.split(',')
    .map((t) => t.trim().replace(/^['"`]|['"`]$/g, ''))
    .filter(Boolean);

  return {
    name: get('name') ?? toKebab(dirName),
    displayName: get('displayName') ?? dirName,
    description: get('description'),
    category: get('category'),
    tags: tags && tags.length > 0 ? tags : undefined,
  };
}

async function loadReadme(
  componentDir: string,
): Promise<{ content: string; format: 'mdx' | 'md' | 'none' }> {
  const mdx = await safeReadFile(path.join(componentDir, 'README.mdx'));
  if (mdx) return { content: mdx, format: 'mdx' };
  const md = await safeReadFile(path.join(componentDir, 'README.md'));
  if (md) return { content: md, format: 'md' };
  return { content: '', format: 'none' };
}

async function loadExamples(componentDir: string): Promise<ExampleSource[]> {
  const examplesDir = path.join(componentDir, 'examples');
  let entries: Dirent[];
  try {
    entries = await fsp.readdir(examplesDir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = entries
    .filter((e) => e.isFile() && VALID_EXAMPLE_EXTENSIONS.has(path.extname(e.name)))
    .sort((a, b) => a.name.localeCompare(b.name));

  return Promise.all(
    files.map(async (entry): Promise<ExampleSource> => {
      const filePath = path.join(examplesDir, entry.name);
      const source = (await safeReadFile(filePath)) ?? '';
      const id = path.basename(entry.name, path.extname(entry.name));
      return { id, file: entry.name, source };
    }),
  );
}

async function readComponentsFromDisk(): Promise<ComponentEntry[]> {
  const root = componentsSrcDir();
  let dirs: Dirent[];
  try {
    dirs = await fsp.readdir(root, { withFileTypes: true });
  } catch {
    return [];
  }

  const entries = await Promise.all(
    dirs
      // Underscore-prefixed folders (`_shared`, `_internal`, …) are package-private — they hold
      // recipes / hooks that components consume but aren't components themselves.
      .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
      .map(async (d): Promise<ComponentEntry> => {
        const componentDir = path.join(root, d.name);
        const [meta, { content: readme, format: readmeFormat }, examples] = await Promise.all([
          loadMeta(d.name, componentDir),
          loadReadme(componentDir),
          loadExamples(componentDir),
        ]);
        return {
          slug: toKebab(d.name),
          dirName: d.name,
          meta,
          readme,
          readmeFormat,
          examples,
          sourcePath: path.join(componentDir, `${d.name}.tsx`),
        };
      }),
  );

  return entries.sort((a, b) => a.meta.displayName.localeCompare(b.meta.displayName));
}

// Cross-request memo. Every page navigation in `next dev` used to re-walk the whole
// `packages/components/src` tree (~N × meta.ts + README + examples reads), which dominated
// navigation latency. We cache the result in-process and revalidate via a short TTL in dev so
// edits still flow through quickly. In production builds the discovery is effectively immutable
// for the life of the process, so we hold onto it indefinitely.
const DISCOVERY_TTL_MS = process.env.NODE_ENV === 'production' ? Infinity : 1500;
let cachedDiscovery: { entries: ComponentEntry[]; expiresAt: number } | null = null;
let inFlightDiscovery: Promise<ComponentEntry[]> | null = null;

/**
 * Scan `packages/components/src/` and return one entry per component directory.
 *
 * Wrapped in React's `cache()` so multiple call sites within the same request (e.g. the layout's
 * sidebar + the page's metadata lookup) share a single invocation, and backed by a module-level
 * TTL cache so navigations between pages don't re-walk the file system from scratch.
 */
export const discoverComponents = cache(async (): Promise<ComponentEntry[]> => {
  const now = Date.now();
  if (cachedDiscovery && now < cachedDiscovery.expiresAt) {
    return cachedDiscovery.entries;
  }
  // Coalesce concurrent refreshes so we never run more than one disk walk at a time.
  inFlightDiscovery ??= readComponentsFromDisk().then((entries) => {
    cachedDiscovery = { entries, expiresAt: Date.now() + DISCOVERY_TTL_MS };
    inFlightDiscovery = null;
    return entries;
  });
  return inFlightDiscovery;
});

export const findComponentBySlug = cache(
  async (slug: string): Promise<ComponentEntry | null> => {
    const all = await discoverComponents();
    return all.find((c) => c.slug === slug) ?? null;
  },
);