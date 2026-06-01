'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

interface IframePreviewProps {
  /** Width of the simulated viewport in CSS pixels. The iframe is centered in its parent. */
  width: number;
  /** Floor for the iframe height before its content has been measured. */
  minHeight?: number;
  children: ReactNode;
}

/**
 * Renders `children` inside a same-origin iframe so the example actually sits in its own
 * `window` with the simulated viewport width. That gives us _real_ responsive behaviour —
 * `@media (max-width: …)` queries, `100vw` widths, `matchMedia` calls, and Tailwind's `sm:` /
 * `md:` / `lg:` breakpoints all evaluate against the iframe's width instead of the docs page
 * width, which a plain `max-width` wrapper can't do.
 *
 * The wiring is:
 *
 *   1. Boot the iframe with a hand-written boilerplate document (so it isn't `about:blank` and
 *      has a `<base href>` to resolve relative parent stylesheet URLs).
 *   2. Clone every `<link rel="stylesheet">` and `<style>` from the parent on mount, then keep
 *      the clones in sync via a `MutationObserver` so HMR-injected updates (Tailwind, Theme
 *      Studio overrides, etc.) flow through to the preview without a refresh.
 *   3. Mirror the theme attributes that drive CSS variables — `data-mode`, `data-variant`,
 *      `data-platform`, plus `dir` and the optional inline `style` `<html>` element — from the
 *      parent root into the iframe root, again with a `MutationObserver` so toggling the
 *      Mode / Variant / Direction controls live-updates the preview.
 *   4. Render `children` straight into the iframe `<body>` via `createPortal`, which keeps
 *      the React tree (and therefore every context provider above us — `ThemeProvider`,
 *      `DirectionProvider`, inspector / splash / etc.) intact.
 *   5. Auto-resize the iframe height to fit content via a `ResizeObserver` on the iframe's
 *      document element, so we don't need an inner scrollbar for tall examples.
 *
 * Limitations:
 *   - Examples that read `window.parent` or assume `window === top` will misbehave; but the
 *     iframe is same-origin, so anything that just inspects `document` / `window.matchMedia`
 *     keeps working.
 *   - We can't propagate _portal-targeted_ DOM (e.g. Radix popovers escaping to `document.body`)
 *     across the boundary; popovers from the example mount into the iframe body, which is the
 *     desired behaviour for a faithful preview.
 */
export function IframePreview({ width, children, minHeight = 200 }: IframePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [body, setBody] = useState<HTMLElement | null>(null);
  const [height, setHeight] = useState(minHeight);

  // `useLayoutEffect` here so the iframe boot work runs before the portal flushes. SSR-guard
  // so Next.js doesn't warn about the layout-effect call during the server pass.
  const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

  useIsoLayoutEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    const win = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (!win || !doc) return;

    doc.open();
    doc.write(
      '<!DOCTYPE html><html><head>' +
        // Resolve every relative stylesheet href against the parent location, since the iframe
        // itself loaded as `about:srcdoc`. Without this, `/_next/static/...` would 404.
        `<base href="${escapeAttr(window.location.href)}">` +
        '<meta charset="utf-8">' +
        // Tight reset: the iframe is meant to host one example, so we strip the default user-
        // agent body margin. Components still bring their own background; the iframe stays
        // transparent so the dotted preview surface shows through any gaps.
        '<style>html,body{margin:0;padding:0;background:transparent;}</style>' +
        '</head><body></body></html>',
    );
    doc.close();

    syncStyles(doc);
    syncRootAttrs(doc);

    // Watch the parent head/body for new stylesheets (HMR adds `<style>` nodes) and re-sync.
    // Throttled with rAF so a burst of mutations from Next's CSS HMR pipeline collapses into
    // a single re-clone.
    let styleSyncQueued = false;
    const queueStyleSync = () => {
      if (styleSyncQueued) return;
      styleSyncQueued = true;
      win.requestAnimationFrame(() => {
        styleSyncQueued = false;
        syncStyles(doc);
      });
    };
    const styleObserver = new MutationObserver(queueStyleSync);
    styleObserver.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['href', 'media'],
    });
    // The runtime `<style data-apx-ds-theme>` injected by `ThemeProvider` lives in the body —
    // watch it too so Theme Studio edits propagate to the iframe.
    styleObserver.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['data-apx-ds-theme'],
    });

    const attrObserver = new MutationObserver(() => syncRootAttrs(doc));
    attrObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-mode', 'data-variant', 'data-platform', 'dir', 'class', 'style'],
    });

    const measure = () => {
      // `documentElement.scrollHeight` captures any absolutely-positioned descendants that
      // `body.offsetHeight` would miss (popovers, sticky toolbars, etc.).
      const next = Math.max(minHeight, doc.documentElement.scrollHeight);
      setHeight(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(doc.documentElement);
    ro.observe(doc.body);

    setBody(doc.body);

    return () => {
      styleObserver.disconnect();
      attrObserver.disconnect();
      ro.disconnect();
      setBody(null);
    };
  }, [minHeight]);

  return (
    <div className="flex w-full justify-center">
      <iframe
        ref={iframeRef}
        title="Component preview"
        // The iframe sits as a "device" inside the dotted preview surface — keep the border /
        // radius / shadow modest so it reads as "this is a viewport" without competing with
        // the component being demoed.
        className="block rounded-lg border border-border bg-bg shadow-md"
        style={{ width: `${width}px`, height: `${height}px`, maxWidth: '100%' }}
      />
      {body ? createPortal(children, body) : null}
    </div>
  );
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

const CLONE_MARKER = 'data-apx-iframe-clone';

/**
 * Mirror every stylesheet that affects the parent document into the iframe's `<head>`. We
 * blow away the prior clones first to keep ordering deterministic — most stylesheets are
 * idempotent enough that a full rewrite per HMR tick is cheap.
 */
function syncStyles(targetDoc: Document) {
  const head = targetDoc.head;
  if (!head) return;
  head.querySelectorAll(`[${CLONE_MARKER}]`).forEach((el) => el.remove());

  const sources = document.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
    'link[rel="stylesheet"], style',
  );

  sources.forEach((src) => {
    let clone: HTMLElement;
    if (src instanceof HTMLLinkElement) {
      const link = targetDoc.createElement('link');
      link.rel = 'stylesheet';
      // Force-resolve against the parent location so a `/_next/...` href works inside the
      // iframe (which has no implicit base of its own).
      const href = src.getAttribute('href') ?? '';
      try {
        link.href = new URL(href, window.location.href).href;
      } catch {
        link.href = href;
      }
      if (src.media) link.media = src.media;
      clone = link;
    } else {
      const style = targetDoc.createElement('style');
      style.textContent = src.textContent ?? '';
      // Preserve any `data-*` markers the original carried (e.g. `data-apx-ds-theme`) so we
      // can spot and selectively replace them later if needed.
      for (const attr of Array.from(src.attributes)) {
        if (attr.name.startsWith('data-') && attr.name !== CLONE_MARKER) {
          style.setAttribute(attr.name, attr.value);
        }
      }
      clone = style;
    }
    clone.setAttribute(CLONE_MARKER, '');
    head.appendChild(clone);
  });
}

/**
 * Mirror the small set of `<html>` attributes that drive `@apx-ui/ds` theming. We do not
 * copy `id`, `lang`, `suppressHydrationWarning`, etc. — only the ones the design system
 * uses to scope its CSS variables.
 */
function syncRootAttrs(targetDoc: Document) {
  const parent = document.documentElement;
  const root = targetDoc.documentElement;
  if (!parent || !root) return;
  const attrs = ['data-mode', 'data-variant', 'data-platform', 'data-theme', 'dir', 'style'];
  for (const name of attrs) {
    const value = parent.getAttribute(name);
    if (value === null) {
      root.removeAttribute(name);
    } else if (root.getAttribute(name) !== value) {
      root.setAttribute(name, value);
    }
  }
}