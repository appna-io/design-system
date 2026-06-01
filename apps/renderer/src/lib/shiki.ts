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

/**
 * Discard the cached highlighter so the next `getHighlighter()` call boots a fresh WASM
 * instance. Used as a recovery path when a `codeToHtml` call throws — the WASM linear memory
 * can be left in a corrupted state ("memory access out of bounds") that no subsequent call
 * can recover from without reinstantiating.
 */
function resetHighlighter(): void {
  highlighterPromise = null;
}

export interface HighlightResult {
  light: string;
  dark: string;
}

/**
 * Render a snippet to HTML in both light + dark themes. The renderer's `<CodeBlock>` then shows
 * the correct one based on the current `data-mode` attribute (no runtime re-highlighting).
 *
 * Shiki's WASM grammar engine is **not reentrant** — concurrent `codeToHtml` calls from
 * sibling RSC subtrees can corrupt the shared linear memory and surface as `RuntimeError:
 * memory access out of bounds`. We serialize all highlights through a chained promise so
 * only one call touches the WASM instance at a time. The overhead is negligible on real
 * workloads (highlights are ms-scale) and the chain dies with the request lifetime.
 */
let highlightChain: Promise<unknown> = Promise.resolve();

const FALLBACK = (code: string): string =>
  `<pre><code>${code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')}</code></pre>`;

export async function highlight(code: string, lang: string): Promise<HighlightResult> {
  const safeLang = (LANGS as readonly string[]).includes(lang) ? lang : 'tsx';
  const opts = { lang: safeLang, structure: 'classic' as const };
  const next = highlightChain.then(async () => {
    try {
      const highlighter = await getHighlighter();
      const light = highlighter.codeToHtml(code, { ...opts, theme: 'github-light' });
      const dark = highlighter.codeToHtml(code, { ...opts, theme: 'github-dark' });
      return { light, dark };
    } catch (err) {
      // WASM linear memory is non-recoverable once corrupted ("memory access out of bounds").
      // Reset the highlighter so future calls boot a fresh instance, and fall back to plain
      // pre/code so the render keeps working in the meantime.
      resetHighlighter();
      const fallback = FALLBACK(code);
      return { light: fallback, dark: fallback };
    }
  });
  // Swallow errors on the chain so one bad call doesn't poison every following call.
  highlightChain = next.catch(() => undefined);
  return next;
}