/**
 * Derives a dark palette from a brand's light one.
 *
 * ## The bug this exists to stop
 *
 * A template theme is a deep-partial override. Supply `palette.light` and say nothing about
 * `palette.dark`, and the merge does exactly what it is told: dark mode keeps the design system's
 * default indigo. So a template with a deep-green brand renders green in light mode and generic
 * indigo in dark — the brand simply vanishes, with no error, on half the sessions. Two shipped
 * templates had this, and one of them had a doc comment carefully explaining the omission as
 * deliberate, which is the tell: the author made a reasonable local decision and could not see
 * the user-visible consequence.
 *
 * Asking every template author to hand-author a second palette does not fix it either — it just
 * moves the failure to whoever forgets. So the system derives one.
 *
 * ## What a dark palette actually is
 *
 * Not an inversion. A brand's dark mode keeps the **hue** and changes what the colour has to do:
 *
 * - **Accents get lighter.** A deep green that reads beautifully on paper is nearly invisible on
 *   a near-black ground. The accent has to climb until it clears 4.5:1 against the dark
 *   background, and it climbs by raising lightness while holding hue and saturation, so it stays
 *   recognisably the same colour rather than becoming a different one.
 * - **`subtle` inverts its job.** In light mode it is a pale tint of the hue; in dark mode a pale
 *   tint is a glaring panel. It becomes a *dark* tint — the hue mixed down into the ground.
 * - **Grounds keep the brand's temperature.** A warm cream paper should become a warm near-black,
 *   not a neutral grey one. Carrying the hue across is most of what makes a derived dark mode
 *   feel like the same brand rather than a generic dark theme wearing its accent.
 */

interface RoleShape {
  main?: string;
  contrast?: string;
  hover?: string;
  active?: string;
  subtle?: string;
  border?: string;
}

import { contrastRatio, hexToHsl, hslToHex, mix } from '@apx-ui/tokens';

// The colour maths moved down to `@apx-ui/tokens` so the packages below `theme` can reach it too
// (see `tokens/src/contrast.ts`). Re-exported from here because this module was its address for
// every existing consumer, and moving a file should not be a breaking change.
export { contrastRatio, hexToHsl, hslToHex } from '@apx-ui/tokens';

/** Minimum contrast an accent must reach against the dark ground before it is usable as text. */
const MIN_ACCENT_CONTRAST = 4.5;

/** Body-text minimum (WCAG 1.4.3). `foreground.muted` and `.subtle` carry small text. */
const MIN_TEXT_CONTRAST = 4.5;

/**
 * Minimum for a border that conveys something (WCAG 1.4.11) — an input's edge, an outline
 * button's ring. `border.subtle` is a decorative hairline and is deliberately exempt.
 */
const MIN_UI_CONTRAST = 3;

/** Roles that carry brand identity and therefore get derived. */
const BRAND_ROLES = ['primary', 'secondary', 'neutral'] as const;

/**
 * Raise a colour's lightness until it clears `MIN_ACCENT_CONTRAST` against the ground, holding
 * hue and saturation so it stays the same colour rather than drifting into a different one.
 */
function liftForDark(hex: string, ground: string): string {
  const hsl = hexToHsl(hex);
  if (!hsl) return hex;

  let candidate = hex;
  for (let l = hsl.l; l <= 0.95; l += 0.02) {
    candidate = hslToHex({ ...hsl, l });
    if (contrastRatio(candidate, ground) >= MIN_ACCENT_CONTRAST) return candidate;
  }
  return candidate;
}

/**
 * Mix white into the ground until the result clears `target` against it, starting from `from`.
 *
 * The counterpart to `liftForDark`, and it exists for the same reason: **a fixed mix ratio cannot
 * serve a variable ground.** The foreground steps were authored as constants (0.94 / 0.62 / 0.44),
 * which is fine against the neutral `#09090b` fallback and quietly wrong against a *tinted* one —
 * and tinting the ground to carry the brand's temperature is the whole point of this file. On
 * fernwood's warm-black `#100e0a`, `subtle` at 0.44 measured **4.37:1** and on lyli-coffee's
 * **4.35:1**, both under the 4.5 line, for the token those templates use for footnotes and
 * captions. Small text is exactly where a near-miss is least defensible.
 *
 * So the steps are derived and then *checked*, the way the accents already were. `from` stays the
 * designed starting point, so nothing moves on a ground where the constant was already correct.
 */
function mixUntil(from: number, ground: string, target: number): string {
  return mix('#ffffff', amountUntil(from, ground, target), ground);
}

/** The white fraction `mixUntil` settles on. Exposed so a later step can start above an earlier one. */
function amountUntil(from: number, ground: string, target: number): number {
  for (let amount = from; amount <= 1; amount += 0.02) {
    if (contrastRatio(mix('#ffffff', amount, ground), ground) >= target) return amount;
  }
  return 1;
}

/** Black or white, whichever is more readable on `hex`. */
function readableOn(hex: string): string {
  return contrastRatio(hex, '#ffffff') >= contrastRatio(hex, '#000000') ? '#ffffff' : '#0b0b0d';
}

function deriveRole(light: RoleShape, ground: string): RoleShape {
  if (!light.main) return {};
  const main = liftForDark(light.main, ground);
  const hsl = hexToHsl(main);

  return {
    main,
    contrast: readableOn(main),
    // Hover goes *lighter* on dark, the opposite of the light-mode convention: on a dark ground
    // "more prominent" means closer to the light, not further from it.
    hover: hsl ? hslToHex({ ...hsl, l: Math.min(0.95, hsl.l + 0.08) }) : main,
    active: hsl ? hslToHex({ ...hsl, l: Math.min(0.98, hsl.l + 0.16) }) : main,
    // `subtle` flips its job: a pale tint is a glaring panel on dark, so it becomes the hue
    // mixed down into the ground.
    subtle: mix(main, 0.18, ground),
    border: mix(main, 0.42, ground),
  };
}

/**
 * Build a dark palette from a light one. Only brand roles and the grounds are derived — status
 * colours (success / warning / danger / info) already have well-tuned dark defaults and carry no
 * brand identity, so inventing them here would be worse than inheriting them.
 */
export function deriveDarkPalette(
  light: Record<string, unknown>,
): Record<string, unknown> | undefined {
  if (!light || typeof light !== 'object') return undefined;

  const lightBg = (light['background'] as { default?: string } | undefined)?.default;
  const lightBgHsl = lightBg ? hexToHsl(lightBg) : undefined;

  // Carry the brand's temperature into the dark ground: a warm cream paper becomes a warm
  // near-black, not a neutral grey one. This is most of what makes a derived dark mode feel like
  // the same brand rather than a generic dark theme wearing its accent.
  const ground =
    lightBgHsl && lightBgHsl.s > 0.02
      ? hslToHex({ h: lightBgHsl.h, s: Math.min(lightBgHsl.s, 0.22), l: 0.05 })
      : '#09090b';

  const derived: Record<string, unknown> = {};
  let touched = false;

  for (const role of BRAND_ROLES) {
    const source = light[role] as RoleShape | undefined;
    if (!source?.main) continue;
    derived[role] = deriveRole(source, ground);
    touched = true;
  }

  if (!touched) return undefined;

  const paper = mix('#ffffff', 0.06, ground);
  const primaryMain = (derived['primary'] as RoleShape | undefined)?.main;

  const subtleGround = mix('#ffffff', 0.1, ground);

  derived['background'] = {
    default: ground,
    paper,
    subtle: subtleGround,
  };
  derived['foreground'] = {
    // Tinted toward the ground rather than pure white: a pure-white foreground on a warm ground
    // reads as a mismatch, and it is also harsher than it needs to be.
    //
    // `default` needs no floor — 0.94 is ~17:1 on any ground this function can produce. The other
    // two are clamped, because they are the ones that carry small text and the ones a tinted
    // ground pushes under the line. See `mixUntil`.
    default: mix('#ffffff', 0.94, ground),
    // Clamped against `background.subtle`, not `background.default`.
    //
    // A dark palette has more than one ground, and `subtle` is the *lightest* of them — so text
    // that clears the page background can still fail inside a subtle panel, which is precisely
    // where muted metadata tends to live. Measured against the page ground alone, the derived
    // `foreground.subtle` passed at 4.6:1 and then failed at 3.65:1 on the panel two elements
    // away. Clamping against the lightest ground satisfies both, because anything readable there
    // is more readable on the darker one.
    muted: mixUntil(0.62, subtleGround, MIN_TEXT_CONTRAST),
    subtle: mixUntil(0.44, subtleGround, MIN_TEXT_CONTRAST),
  };
  derived['border'] = {
    // `default` and `strong` are the borders that carry meaning, so they clear 1.4.11's 3:1.
    // `subtle` is a decorative hairline and stays quiet on purpose — pushing it to 3:1 would turn
    // every divider in a derived dark theme into a rule.
    ...(() => {
      // `strong` starts from wherever `default` had to climb to, not from its own constant —
      // otherwise the clamp collapses them. On a tinted ground `default` has to lift from 0.16 to
      // about 0.28 to clear 3:1, which is exactly where `strong` already sat, and the two render
      // identically. Deriving the scale from the clamped value keeps three steps under any ground.
      const defaultAmount = amountUntil(0.16, ground, MIN_UI_CONTRAST);
      return {
        default: mix('#ffffff', defaultAmount, ground),
        subtle: mix('#ffffff', 0.09, ground),
        strong: mix('#ffffff', Math.min(1, Math.max(0.28, defaultAmount + 0.14)), ground),
      };
    })(),
  };
  if (primaryMain) derived['focusRing'] = primaryMain;

  return derived;
}
