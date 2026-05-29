import 'server-only';

import { createHighlighter, type Highlighter } from 'shiki';

// Themes & langs are intentionally short — Shiki's bundle is dominated by what we pre-load. The
// renderer only ever shows TS/TSX/MDX/CSS examples and we want a dark + light pair that match the
// DS palette closely.
const THEMES = ['github-light', 'github-dark'] as const;
const LANGS = ['tsx', 'ts', 'jsx', 'js', 'css', 'mdx', 'md', 'bash', 'json'] as const;

let highlighterPromise: Promise<Highlighter> | null = null;

/**
 * Return the singleton Shiki highlighter. We instantiate lazily and cache the promise so every
 * concurrent server-component render shares the same WASM instance.
 */
export function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [...THEMES],
    langs: [...LANGS],
  });
  return highlighterPromise;
}

export interface HighlightResult {
  light: string;
  dark: string;
}

/**
 * Render a snippet to HTML in both light + dark themes. The renderer's `<CodeBlock>` then shows
 * the correct one based on the current `data-mode` attribute (no runtime re-highlighting).
 */
export async function highlight(code: string, lang: string): Promise<HighlightResult> {
  const highlighter = await getHighlighter();
  const safeLang = (LANGS as readonly string[]).includes(lang) ? lang : 'tsx';
  const opts = { lang: safeLang, structure: 'classic' as const };
  const light = highlighter.codeToHtml(code, { ...opts, theme: 'github-light' });
  const dark = highlighter.codeToHtml(code, { ...opts, theme: 'github-dark' });
  return { light, dark };
}
