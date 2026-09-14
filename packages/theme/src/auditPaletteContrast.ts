import { contrastRatio } from '@apx-ui/tokens';

/**
 * Measures a palette's text and UI roles against the grounds they are actually painted on.
 *
 * ## Why this exists as a function and not just a test
 *
 * Four separate contrast failures shipped in one day, and not one of them was visible in the
 * source. `foreground-muted` on a brand fill measured 4.03:1 and looked fine. A derived
 * `foreground.subtle` landed at 4.35:1 because the accents were clamped and the foregrounds were
 * not. An outline button's border went invisible on a dark band. A whole brand vanished in dark
 * mode because a palette was absent rather than wrong.
 *
 * They share a shape: **nothing is wrong in the code, so nothing can be found by reading it.**
 * The only defence is measuring the output. That is cheap — WCAG contrast is arithmetic — but it
 * has to be run, which means it has to be a function a test can call on any palette, authored or
 * derived, rather than a checklist item someone remembers.
 */

export interface ContrastFailure {
  /** Dotted path of the role that failed, e.g. `foreground.subtle`. */
  role: string;
  /** What it was measured against. */
  against: string;
  ratio: number;
  required: number;
  /** Why this threshold — the WCAG success criterion the role falls under. */
  reason: string;
}

interface RoleColors {
  main?: string;
  contrast?: string;
  hover?: string;
  active?: string;
}

/**
 * The states a solid fill actually paints. `main` alone is not enough — see the interaction-state
 * loop below for the failure that taught us so.
 */
const FILL_STATES = ['main', 'hover', 'active'] as const;

/**
 * Structurally minimal so this accepts a full `PaletteShape`, a partial brand override, and a
 * freshly derived palette alike. The point is to be callable on *any* palette-shaped thing —
 * a checker only the canonical type can use is one that never runs on the values that break.
 */
interface PaletteLike {
  background?: { default?: string; paper?: string; subtle?: string };
  foreground?: { default?: string; muted?: string; subtle?: string };
  border?: { default?: string; subtle?: string; strong?: string; control?: string };
}

/** Body text (WCAG 1.4.3). Everything a template sets in `body` / `bodySmall` / `caption`. */
const TEXT = 4.5;
/** Non-text UI boundaries — an input edge, an outline button's ring (WCAG 1.4.11). */
const UI = 3;

/**
 * Roles whose `main` a template genuinely uses as **text** — a link, an eyebrow, an accent word.
 * Deliberately excludes the status roles: `warning.main` is a yellow, and holding a yellow to
 * 4.5:1 as body text would fail every usable warning colour in existence. Status colours are used
 * as fills, icons and borders, and those uses are covered by the checks that follow.
 */
const TEXT_ACCENT_ROLES = ['primary', 'secondary', 'neutral'];

/**
 * Every role that can be a solid fill with a label on it. This check has no exceptions — an
 * unreadable label on a `danger` button is unreadable regardless of what the colour means.
 */
const FILL_ROLES = ['primary', 'secondary', 'neutral', 'success', 'warning', 'danger', 'info'];

/**
 * Takes a plain `object` rather than the canonical `PaletteShape`, deliberately. This has to be
 * callable on a full theme palette, a partial brand override and a freshly derived palette
 * alike — a checker that only accepts the canonical type is one that never runs on the values
 * that actually break, which is how three of today's four contrast failures reached templates.
 */
export function auditPaletteContrast(palette: object): ContrastFailure[] {
  const failures: ContrastFailure[] = [];
  const p = palette as PaletteLike & Record<string, unknown>;
  const ground = p.background?.default;
  if (!ground) return failures;

  const check = (
    role: string,
    color: string | undefined,
    against: string | undefined,
    required: number,
    reason: string,
  ) => {
    if (!color || !against) return;
    const ratio = contrastRatio(color, against);
    if (ratio < required) {
      failures.push({ role, against, ratio: Number(ratio.toFixed(2)), required, reason });
    }
  };

  // Body copy on every ground it can land on. `background.subtle` matters as much as `default` —
  // a muted line inside a subtle panel is the combination nobody checks.
  for (const [step, required] of [
    ['default', TEXT],
    ['muted', TEXT],
    // `subtle` is small metadata text. It is *not* exempt: templates use it for footnotes and
    // captions, which is the opposite of the large-text case where 3:1 is defensible.
    ['subtle', TEXT],
  ] as const) {
    const color = p.foreground?.[step];
    check(`foreground.${step}`, color, ground, required, 'WCAG 1.4.3 — body text');
    check(
      `foreground.${step} on background.subtle`,
      color,
      p.background?.subtle,
      required,
      'WCAG 1.4.3 — body text on a subtle panel',
    );
  }

  // Only `control` is held to 1.4.11. `default` and `strong` are decorative — a card outline and
  // a panel divider are not UI components, and holding them to 3:1 makes every card shout. They
  // were the same role until an input's edge measured 1.27:1 while being as dark as a card could
  // take; one value cannot serve both, so the roles were split rather than the threshold fudged.
  check(
    'border.control',
    p.border?.control,
    ground,
    UI,
    'WCAG 1.4.11 — an interactive control\'s edge',
  );

  for (const role of TEXT_ACCENT_ROLES) {
    const colors = p[role] as RoleColors | undefined;
    check(`${role}.main`, colors?.main, ground, TEXT, 'WCAG 1.4.3 — accent used as text');
  }

  for (const role of FILL_ROLES) {
    const colors = p[role] as RoleColors | undefined;
    if (!colors?.main) continue;

    // Every state the fill paints, not just `main`.
    //
    // Checking `main` alone is what let the worst failures in the DS default palette ship: dark
    // `primary.main` measured 4.47:1 and passed, while `hover` was 2.98 and `active` 1.99 — a
    // label that fades to invisible precisely as the user interacts with the button. Three roles
    // failed that way and this check reported all three as fine.
    for (const state of FILL_STATES) {
      check(
        `${role}.contrast on ${role}.${state}`,
        colors.contrast,
        colors[state],
        TEXT,
        'WCAG 1.4.3 — label on a solid fill',
      );
    }

    // Direction, reported only when it actually costs readability.
    //
    // A dark ramp brightens on hover/active; a light ramp darkens. The ink has to agree with the
    // direction — a white label on a brightening ramp loses contrast at every step, which is how
    // the dark `primary` / `danger` / `info` roles decayed to ~1.9:1 by `active`.
    //
    // But a *declining* ramp is not itself a defect. Light `warning` is a dark label on amber that
    // darkens: 8.26 → 5.57 → 4.91:1. Contrast falls the whole way and every state is still
    // comfortably readable, which is exactly what a dark-ink role is supposed to look like.
    // Flagging that would mean exempting every legitimate role until the rule meant nothing.
    //
    // So this fires only when the slide ends below the floor — the case where the direction is the
    // *explanation* for a real failure. It names the shared cause once, instead of leaving the
    // reader to infer it from three separate ratio failures.
    const ratios = FILL_STATES.map((state) =>
      colors.contrast && colors[state] ? contrastRatio(colors.contrast, colors[state]) : null,
    );
    const first = ratios[0];
    const last = ratios[ratios.length - 1];
    if (first != null && last != null && last < first - 0.01 && last < TEXT) {
      failures.push({
        role: `${role}.ramp`,
        against: `${role}.contrast`,
        ratio: Number(last.toFixed(2)),
        required: TEXT,
        reason:
          `ramp direction — contrast falls from ${first.toFixed(2)}:1 at main to ` +
          `${last.toFixed(2)}:1 at ${FILL_STATES[FILL_STATES.length - 1]}; ` +
          'the label colour is fighting the ramp',
      });
    }
  }

  return failures;
}

/** Formats failures for a test message — role, measured, required, and why. */
export function formatContrastFailures(failures: readonly ContrastFailure[]): string {
  return failures
    .map((f) => `  ${f.role} on ${f.against}: ${f.ratio}:1 (needs ${f.required}:1 — ${f.reason})`)
    .join('\n');
}
