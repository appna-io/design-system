import 'server-only';

import fs from 'node:fs';
import path from 'node:path';
import { cache } from 'react';
import {
  withCustomConfig,
  type ComponentDoc,
  type FileParser,
  type PropItem,
} from 'react-docgen-typescript';

type DocTags = Record<string, string> | undefined;

import { workspaceRoot } from './paths';

export interface PropRow {
  name: string;
  type: string;
  required: boolean;
  defaultValue: string | null;
  description: string;
  deprecated: boolean;
  experimental: boolean;
}

export interface PropsDoc {
  displayName: string;
  description: string;
  rows: PropRow[];
}

let parserPromise: Promise<FileParser> | null = null;

function getParser(): Promise<FileParser> {
  parserPromise ??= (async () => {
    const tsconfigPath = path.join(workspaceRoot(), 'tsconfig.base.json');
    return withCustomConfig(tsconfigPath, {
      savePropValueAsString: true,
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: (prop: PropItem) => {
        if (prop.parent) {
          // Skip props inherited from DOM / React intrinsics so the tables stay focused on the
          // component-authored API surface.
          return !/node_modules/.test(prop.parent.fileName);
        }
        return true;
      },
    });
  })();
  return parserPromise;
}

function renderType(prop: PropItem): string {
  // `name` is usually the cleanest representation; fall back to `raw` for complex unions.
  return prop.type.name || (prop.type as { raw?: string }).raw || 'unknown';
}

// `react-docgen-typescript` rebuilds a TypeScript program on every `parse()` call, so a naive
// re-extract on each navigation costs hundreds of ms. We memoize by (sourcePath, mtimeMs): the
// result is reused until the underlying file changes on disk, which makes repeat visits to the
// same component page effectively free and makes the props table no longer dominate render time.
const propsCache = new Map<string, PropsDoc | null>();

async function extractPropsUncached(sourcePath: string): Promise<PropsDoc | null> {
  if (!fs.existsSync(sourcePath)) return null;
  const parser = await getParser();
  let docs: ComponentDoc[];
  try {
    docs = parser.parse(sourcePath);
  } catch {
    return null;
  }
  if (!docs.length) return null;

  const doc = docs[0]!;
  const rows: PropRow[] = Object.values(doc.props)
    .map((prop) => {
      const tags = prop.tags as DocTags;
      const rawDefault = prop.defaultValue as { value?: unknown } | null | undefined;
      const defaultValue = rawDefault && rawDefault.value != null ? String(rawDefault.value) : null;
      return {
        name: prop.name,
        type: renderType(prop),
        required: prop.required,
        defaultValue,
        description: prop.description ?? '',
        deprecated: tags?.deprecated !== undefined,
        experimental: tags?.experimental !== undefined,
      };
    })
    .sort((a, b) => {
      if (a.required !== b.required) return a.required ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  return {
    displayName: doc.displayName,
    description: doc.description,
    rows,
  };
}

/**
 * Parse a component source file with `react-docgen-typescript` and return prop documentation rows.
 * Returns `null` if the file can't be parsed or yields no components. Memoized by file mtime so
 * unchanged components don't re-parse on every navigation. Also wrapped in React's `cache()` so
 * concurrent renders within a single request share the same lookup.
 */
export const extractProps = cache(async (sourcePath: string): Promise<PropsDoc | null> => {
  let mtimeMs = 0;
  try {
    mtimeMs = (await fs.promises.stat(sourcePath)).mtimeMs;
  } catch {
    return null;
  }
  const key = `${sourcePath}#${mtimeMs}`;
  const cached = propsCache.get(key);
  if (cached !== undefined) return cached;
  const result = await extractPropsUncached(sourcePath);
  propsCache.set(key, result);
  return result;
});
