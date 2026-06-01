import { cv } from '@apx-ui/engine';

/**
 * Two recipes — the rule itself, and the labeled wrapper.
 *
 * `dividerRuleRecipe` is what every unlabeled divider (the `<hr>` form) uses. `orientation`
 * picks block- vs inline-display + sizing; `thickness` × `orientation` resolves to the right
 * `border-t-*` / `border-s-*` utility; `color` maps to the three border tokens.
 *
 * `dividerLabeledRecipe` is the flex-row wrapper that draws the rule on either side of an
 * inline label via the same border-color tokens. The lines are rendered as **real child
 * elements** (`<span aria-hidden>`) rather than CSS pseudo-elements — that keeps the JIT
 * scanner happy (it sees every class literally) and lets us reuse the same `border-X` /
 * `border-strong` classes without re-mapping into `before:border-` variants.
 *
 * RTL: vertical dividers use `border-s` (border-inline-start), which Tailwind already maps
 * to `border-left` in LTR + `border-right` in RTL, so a vertical divider always sits on the
 * visually-leading edge regardless of direction. No per-dir branches.
 */
export const dividerRuleRecipe = cv({
  base: 'shrink-0 border-0 m-0',
  variants: {
    orientation: {
      horizontal: 'w-full block',
      vertical: 'h-full inline-block self-stretch',
    },
    variant: {
      solid: 'border-solid',
      dashed: 'border-dashed',
      dotted: 'border-dotted',
    },
    // The `thickness` variant uses string keys (`'1'` / `'2'` / `'4'`) because `cv`'s
    // `VariantValues` type is `Record<string, string>`. The public `DividerThickness` type
    // keeps the friendly numeric form (`1 | 2 | 4`) — the component coerces with `String(…)`
    // before handing the prop to `useThemedClasses`. The compound rules below match against
    // these string keys.
    thickness: {
      '1': '',
      '2': '',
      '4': '',
    },
    color: {
      subtle: 'border-border-subtle',
      default: 'border-border-default',
      strong: 'border-border-strong',
    },
  },
  compoundVariants: [
    { orientation: 'horizontal', thickness: '1', class: 'border-t' },
    { orientation: 'horizontal', thickness: '2', class: 'border-t-2' },
    { orientation: 'horizontal', thickness: '4', class: 'border-t-4' },
    { orientation: 'vertical', thickness: '1', class: 'border-s' },
    { orientation: 'vertical', thickness: '2', class: 'border-s-2' },
    { orientation: 'vertical', thickness: '4', class: 'border-s-4' },
  ],
  defaultVariants: {
    orientation: 'horizontal',
    variant: 'solid',
    thickness: '1',
    color: 'subtle',
  },
});

/**
 * Wrapper for the labeled variant. The `<span>`s on either side of the label use the same
 * `border-X` classes the rule recipe picks — color / variant / thickness flow through via
 * inline classes on the spans inside the component (so the labels track the consumer's prop
 * choices without re-listing every compound here).
 */
export const dividerLabeledRecipe = cv({
  base: 'flex items-center w-full text-sm text-fg-muted gap-3',
  variants: {
    labelPosition: {
      start: '',
      center: '',
      end: '',
    },
  },
  defaultVariants: { labelPosition: 'center' },
});