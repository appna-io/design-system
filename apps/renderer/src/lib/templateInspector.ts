import 'server-only';

import fsp from 'node:fs/promises';
import path from 'node:path';

import type {
  InspectableSource,
  InspectableSourceMap,
} from '../components/templates/inspector';
import type { TemplateMeta } from '../templates';
import { templatesDir } from './paths';
import { highlight } from './shiki';

const EXT_TO_LANG: Record<string, string> = {
  '.tsx': 'tsx',
  '.ts': 'ts',
  '.jsx': 'jsx',
  '.js': 'js',
  '.css': 'css',
  '.mdx': 'mdx',
  '.md': 'md',
};

/**
 * Read + Shiki-highlight every inspectable section declared on a template's
 * meta, returning a map keyed by `id` ready to hand to `<InspectorProvider>`.
 *
 * Runs server-side; the resulting HTML strings are streamed to the client so
 * there is no client-side Shiki bundle on the critical path. Missing files are
 * skipped (with a console warning) rather than throwing — a stale entry in
 * `meta.inspectable` shouldn't break the whole preview.
 */
export async function loadInspectableSources(
  meta: TemplateMeta,
): Promise<InspectableSourceMap> {
  if (!meta.inspectable || meta.inspectable.length === 0) return {};

  const root = path.join(templatesDir(), meta.slug);
  const entries = await Promise.all(
    meta.inspectable.map(async (section): Promise<InspectableSource | null> => {
      const filePath = path.join(root, section.file);
      try {
        const raw = await fsp.readFile(filePath, 'utf8');
        const lang = EXT_TO_LANG[path.extname(section.file)] ?? 'tsx';
        const { light, dark } = await highlight(raw, lang);
        return {
          id: section.id,
          label: section.label,
          file: section.file,
          raw,
          light,
          dark,
        };
      } catch (err) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(
            `[templateInspector] could not load source for "${meta.slug}/${section.file}":`,
            err,
          );
        }
        return null;
      }
    }),
  );

  const map: InspectableSourceMap = {};
  for (const entry of entries) {
    if (entry) map[entry.id] = entry;
  }
  return map;
}