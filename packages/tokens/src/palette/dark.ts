import type { PaletteShape } from '@apx-ui/engine';

/**
 * Default DARK palette. Same shape as `lightPalette`. Role names stay identical; only the hex
 * values shift so components can switch modes without re-wiring class strings.
 */
export const darkPalette: PaletteShape = {
  primary: {
    // Converted to the bright-fill / dark-ink pattern the four working roles below already use.
    // It previously kept the LIGHT palette's white label while the dark ramp brightens on hover —
    // so the label faded as the button lit up: 4.47 → 2.98 → 1.99:1, invisible by `active`.
    main: '#818cf8',
    contrast: '#0b0f2e',
    hover: '#a5b4fc',
    active: '#c7d2fe',
    subtle: '#1e1b4b',
    border: '#3730a3',
  },
  secondary: {
    main: '#38bdf8',
    contrast: '#0c1828',
    hover: '#7dd3fc',
    active: '#bae6fd',
    subtle: '#082f49',
    border: '#0369a1',
  },
  success: {
    main: '#22c55e',
    contrast: '#052e16',
    hover: '#4ade80',
    active: '#86efac',
    subtle: '#052e16',
    border: '#166534',
  },
  warning: {
    main: '#fbbf24',
    contrast: '#1c1410',
    hover: '#fcd34d',
    active: '#fde68a',
    subtle: '#451a03',
    border: '#92400e',
  },
  danger: {
    // Same conversion as `primary` — was 3.76 → 2.77 → 1.90:1 with a white label.
    main: '#f87171',
    contrast: '#2b0a0a',
    hover: '#fca5a5',
    active: '#fecaca',
    subtle: '#450a0a',
    border: '#991b1b',
  },
  info: {
    // Same conversion as `primary` — was 3.68 → 2.54 → 1.80:1 with a white label.
    main: '#60a5fa',
    contrast: '#08172e',
    hover: '#93c5fd',
    active: '#bfdbfe',
    subtle: '#172554',
    border: '#1e40af',
  },
  neutral: {
    main: '#a1a1aa',
    contrast: '#18181b',
    hover: '#d4d4d8',
    active: '#e4e4e7',
    subtle: '#27272a',
    border: '#3f3f46',
  },
  background: {
    default: '#09090b',
    paper: '#18181b',
    subtle: '#27272a',
  },
  foreground: {
    default: '#fafafa',
    muted: '#a1a1aa',
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
    subtle: '#94949c',
  },
  border: {
    default: '#3f3f46',
    subtle: '#27272a',
    strong: '#52525b',
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
    control: '#696973',
  },
  overlay: 'rgba(0, 0, 0, 0.7)',
  focusRing: '#818cf8',
};