import type { PaletteShape } from '@apx-ui/engine';

/**
 * Default LIGHT palette. Concrete sRGB values keyed by semantic role. Components reference
 * `palette.primary.main` — never the raw hex — so swapping a role here updates every consumer.
 */
export const lightPalette: PaletteShape = {
  primary: {
    main: '#4f46e5',
    contrast: '#ffffff',
    hover: '#4338ca',
    active: '#3730a3',
    subtle: '#eef2ff',
    border: '#c7d2fe',
  },
  secondary: {
    // Shifted two steps down the sky ramp (was `#0ea5e9`). A white label on sky-500 is 2.77:1 —
    // the worst contrast in the DS, and unreadable. sky-700 carries it at 5.93:1.
    main: '#0369a1',
    contrast: '#ffffff',
    hover: '#075985',
    active: '#0c4a6e',
    subtle: '#e0f2fe',
    border: '#bae6fd',
  },
  success: {
    // One step down the green ramp (was `#16a34a`, 3.30:1 with white — large-text only).
    main: '#15803d',
    contrast: '#ffffff',
    hover: '#166534',
    active: '#14532d',
    subtle: '#dcfce7',
    border: '#bbf7d0',
  },
  warning: {
    main: '#f59e0b',
    contrast: '#111827',
    hover: '#d97706',
    // Capped rather than continuing down the amber ramp. `warning` is the one light role with a
    // DARK label, so its ramp works backwards from the others: every step darker costs contrast
    // instead of gaining it, and amber-700 (`#b45309`) had fallen to 3.53:1.
    active: '#c67210',
    subtle: '#fef3c7',
    border: '#fde68a',
  },
  danger: {
    main: '#dc2626',
    contrast: '#ffffff',
    hover: '#b91c1c',
    active: '#991b1b',
    subtle: '#fee2e2',
    border: '#fecaca',
  },
  info: {
    main: '#2563eb',
    contrast: '#ffffff',
    hover: '#1d4ed8',
    active: '#1e40af',
    subtle: '#dbeafe',
    border: '#bfdbfe',
  },
  neutral: {
    main: '#52525b',
    contrast: '#ffffff',
    hover: '#3f3f46',
    active: '#27272a',
    subtle: '#f4f4f5',
    border: '#e4e4e7',
  },
  background: {
    default: '#ffffff',
    paper: '#fafafa',
    subtle: '#f4f4f5',
  },
  foreground: {
    default: '#18181b',
    muted: '#52525b',
    /**
     * Small metadata text — a caption, a footnote, a timestamp.
     *
     * Sized down from `muted` rather than lightened from it: the old value (`#71717a` in both
     * modes) measured 4.40:1 on the light subtle panel and 3.08:1 on the dark one, under the
     * 4.5:1 body-text floor in exactly the place it is most used. Small text is where a near-miss
     * is least defensible, so this clears the floor on `background.subtle` — the *lightest* ground
     * it can land on in light mode and the *darkest* in dark — which means it clears it
     * everywhere.
     */
    subtle: '#67676f',
  },
  border: {
    default: '#e4e4e7',
    subtle: '#f4f4f5',
    strong: '#a1a1aa',
    /**
     * The edge of an interactive control — an input, a select, a checkbox.
     *
     * Separate from `default` because the two have irreconcilable requirements. A control's
     * boundary is a **non-text UI component** under WCAG 1.4.11 and must clear 3:1, or the user
     * cannot see where the field is. A card outline is decoration and has no minimum — and at 3:1
     * it stops reading as a hairline and starts shouting.
     *
     * One role cannot be both, which is why `default` measured 1.27:1 in light and 1.91:1 in dark
     * while being used for both jobs. Raising it would have failed the cards; leaving it failed
     * the inputs. Splitting the role is the only answer that does not trade one for the other.
     */
    control: '#8a8a93',
  },
  overlay: 'rgba(0, 0, 0, 0.5)',
  focusRing: '#4f46e5',
};