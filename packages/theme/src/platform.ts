import type { ThemePlatform } from '@apx-ui/tokens';

/**
 * Runtime detection for the adaptive `default` variant.
 *
 * Returns `'apple'` **only** for real Apple-WebKit browsers (macOS Safari, iOS Safari, iPadOS
 * Safari). Chrome / Edge / Firefox / Opera on the same OS are deliberately excluded — they use
 * Blink or Gecko and should get the apx-base look, not Cupertino.
 *
 * The detection is intentionally conservative: when in doubt, return `'other'`. This guarantees
 * the worst case is "consumers see the canonical look", never the wrong-OS look.
 *
 * Mirrors the inline string template used by `<ThemeScript />` so SSR and CSR agree.
 */
export function detectPlatform(): ThemePlatform {
  if (typeof navigator === 'undefined') return 'other';
  const ua = navigator.userAgent || '';
  const vendor = navigator.vendor || '';
  const isAppleVendor = vendor.indexOf('Apple') !== -1;
  const looksLikeSafari = /Safari\//.test(ua);
  const isImpostor = /Chrome\/|Chromium\/|Edg\/|OPR\/|CriOS\/|FxiOS\/|EdgiOS\//.test(ua);
  return isAppleVendor && looksLikeSafari && !isImpostor ? 'apple' : 'other';
}

/**
 * The body of `detectPlatform()` re-expressed as a single self-contained JS expression,
 * suitable for embedding inside `<ThemeScript />`'s inline string. Producing it here keeps the
 * two implementations in one file so they can't drift.
 *
 * Evaluates to `'apple'` or `'other'` at runtime.
 */
export const DETECT_PLATFORM_EXPR = `(function () {
  if (typeof navigator === 'undefined') return 'other';
  var ua = navigator.userAgent || '';
  var v = navigator.vendor || '';
  var isApple = v.indexOf('Apple') !== -1;
  var safari = /Safari\\//.test(ua);
  var impostor = /Chrome\\/|Chromium\\/|Edg\\/|OPR\\/|CriOS\\/|FxiOS\\/|EdgiOS\\//.test(ua);
  return (isApple && safari && !impostor) ? 'apple' : 'other';
})()`;

/** Type re-export for convenience — consumers shouldn't have to reach into `@apx-ui/tokens`. */
export type { ThemePlatform };
