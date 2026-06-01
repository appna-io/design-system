import type { CompoundVariant } from '@apx-ui/engine';

/**
 * The shared **variant × color** compound matrix for form-control surfaces (Input, Textarea, the
 * future `<Select />` shell, …). 28 entries — every combination of the four variants
 * (`outline` / `solid` / `ghost` / `underline`) × the seven color roles. Each entry paints the
 * focused-state border + ring + background for that one cell.
 *
 * ### Why a helper instead of inline rows
 *
 * The matrix lived inline in `Input.recipe.ts` while Input was the only consumer (per the DS rule
 * "extract on the second consumer"). Phase 8 (Textarea) is that second consumer — duplicating 28
 * rows in `Textarea.recipe.ts` would mean any future palette tweak has to happen in two places.
 * Promoting the matrix here means:
 *
 * - Adding a color = one entry per variant (7 colors → 28 rows). One file edit, both components
 *   pick it up.
 * - Adding a variant = same shape repeated for every color. Compiler-checked via `CompoundVariant`.
 * - The two components **cannot drift** — they're literally the same array.
 *
 * ### Why a function (not a const)
 *
 * The argument `for` is intentional headroom: a future component (think a code-editor textarea
 * with a different `underline` aesthetic) can branch on it. Today it's pure metadata — the
 * function returns the same 28 rows regardless. Returning a fresh array on each call costs
 * effectively nothing (28 literal objects) and keeps the door open without breaking the API
 * later.
 *
 * ### Why every class string is literal
 *
 * Tailwind's source scanner is a **literal-text matcher** — `bg-${color}-subtle` template strings
 * produce CSS that exists in JS memory but not in the generated stylesheet. Every class below is
 * written out as a plain string so the scanner picks it up. This is the same discipline
 * `Input.recipe.ts` (Phase 7) followed before this extraction.
 */
export function variantColorMatrix(_opts: { for: 'Input' | 'Textarea' | (string & {}) }): CompoundVariant[] {
  return [
    // ── outline — focus ring + focused border use the active color ────────────────────────────
    {
      variant: 'outline',
      color: 'primary',
      class: 'focus-within:border-primary focus-within:ring-primary',
    },
    {
      variant: 'outline',
      color: 'secondary',
      class: 'focus-within:border-secondary focus-within:ring-secondary',
    },
    {
      variant: 'outline',
      color: 'success',
      class: 'focus-within:border-success focus-within:ring-success',
    },
    {
      variant: 'outline',
      color: 'warning',
      class: 'focus-within:border-warning focus-within:ring-warning',
    },
    {
      variant: 'outline',
      color: 'danger',
      class: 'focus-within:border-danger focus-within:ring-danger',
    },
    {
      variant: 'outline',
      color: 'info',
      class: 'focus-within:border-info focus-within:ring-info',
    },
    {
      variant: 'outline',
      color: 'neutral',
      class: 'focus-within:border-neutral focus-within:ring-neutral',
    },

    // ── solid — subtle bg pops to paper on focus; ring picks up the color ─────────────────────
    {
      variant: 'solid',
      color: 'primary',
      class: 'focus-within:bg-bg-paper focus-within:ring-primary',
    },
    {
      variant: 'solid',
      color: 'secondary',
      class: 'focus-within:bg-bg-paper focus-within:ring-secondary',
    },
    {
      variant: 'solid',
      color: 'success',
      class: 'focus-within:bg-bg-paper focus-within:ring-success',
    },
    {
      variant: 'solid',
      color: 'warning',
      class: 'focus-within:bg-bg-paper focus-within:ring-warning',
    },
    {
      variant: 'solid',
      color: 'danger',
      class: 'focus-within:bg-bg-paper focus-within:ring-danger',
    },
    {
      variant: 'solid',
      color: 'info',
      class: 'focus-within:bg-bg-paper focus-within:ring-info',
    },
    {
      variant: 'solid',
      color: 'neutral',
      class: 'focus-within:bg-bg-paper focus-within:ring-neutral',
    },

    // ── ghost — invisible at rest; gains a tinted border + subtle bg on hover / focus ─────────
    {
      variant: 'ghost',
      color: 'primary',
      class:
        'hover:bg-primary-subtle focus-within:border-primary focus-within:bg-primary-subtle focus-within:ring-primary',
    },
    {
      variant: 'ghost',
      color: 'secondary',
      class:
        'hover:bg-secondary-subtle focus-within:border-secondary focus-within:bg-secondary-subtle focus-within:ring-secondary',
    },
    {
      variant: 'ghost',
      color: 'success',
      class:
        'hover:bg-success-subtle focus-within:border-success focus-within:bg-success-subtle focus-within:ring-success',
    },
    {
      variant: 'ghost',
      color: 'warning',
      class:
        'hover:bg-warning-subtle focus-within:border-warning focus-within:bg-warning-subtle focus-within:ring-warning',
    },
    {
      variant: 'ghost',
      color: 'danger',
      class:
        'hover:bg-danger-subtle focus-within:border-danger focus-within:bg-danger-subtle focus-within:ring-danger',
    },
    {
      variant: 'ghost',
      color: 'info',
      class:
        'hover:bg-info-subtle focus-within:border-info focus-within:bg-info-subtle focus-within:ring-info',
    },
    {
      variant: 'ghost',
      color: 'neutral',
      class:
        'hover:bg-neutral-subtle focus-within:border-neutral focus-within:bg-neutral-subtle focus-within:ring-neutral',
    },

    // ── underline — bottom rule recolors + thickens via box-shadow inset on focus ─────────────
    // (Growing the actual border would shift surrounding layout; the inset shadow draws over the
    // existing 1px border so the visual weight changes without affecting the box model.)
    {
      variant: 'underline',
      color: 'primary',
      class:
        'focus-within:border-b-primary focus-within:shadow-[inset_0_-1px_0_0_var(--sds-palette-primary-main)]',
    },
    {
      variant: 'underline',
      color: 'secondary',
      class:
        'focus-within:border-b-secondary focus-within:shadow-[inset_0_-1px_0_0_var(--sds-palette-secondary-main)]',
    },
    {
      variant: 'underline',
      color: 'success',
      class:
        'focus-within:border-b-success focus-within:shadow-[inset_0_-1px_0_0_var(--sds-palette-success-main)]',
    },
    {
      variant: 'underline',
      color: 'warning',
      class:
        'focus-within:border-b-warning focus-within:shadow-[inset_0_-1px_0_0_var(--sds-palette-warning-main)]',
    },
    {
      variant: 'underline',
      color: 'danger',
      class:
        'focus-within:border-b-danger focus-within:shadow-[inset_0_-1px_0_0_var(--sds-palette-danger-main)]',
    },
    {
      variant: 'underline',
      color: 'info',
      class:
        'focus-within:border-b-info focus-within:shadow-[inset_0_-1px_0_0_var(--sds-palette-info-main)]',
    },
    {
      variant: 'underline',
      color: 'neutral',
      class:
        'focus-within:border-b-neutral focus-within:shadow-[inset_0_-1px_0_0_var(--sds-palette-neutral-main)]',
    },
  ];
}