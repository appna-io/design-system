import { cv } from '@apx-ui/engine';

import { controlBase } from '../_shared/controlRecipe';
import { variantColorMatrix } from '../_shared/variantColorMatrix';

/**
 * Single source of styling for `<Textarea />`. The wrapper recipe paints the **frame** — border,
 * background, focus ring — and the inner `<textarea>` runs on a tiny secondary recipe that owns
 * the per-size padding-Y / padding-X / font-size / line-height (see `textareaInnerRecipe`).
 *
 * This is the **DRY proof of Phase 7**: the wrapper recipe is structurally identical to
 * `inputRecipe`. It shares `controlBase`, the 28-row `variantColorMatrix({ for: 'Textarea' })`,
 * and the same `aria-[invalid=true]:` attribute selectors. The only delta is the layout
 * primitive (`block` vs Input's `flex items-stretch`) and the absence of Input-specific concerns
 * (no `hasLeftIcon` / `hasLeftAddon` axes, no `aria-busy:cursor-progress`).
 *
 * Phase 7¹ refactored `controlBase` to be layout-free. Each consumer picks its own primitive:
 * Input uses `relative isolate flex items-stretch overflow-hidden`; Textarea uses `relative` (so
 * the absolute counter footer positions correctly) + `block w-full` (so the textarea behaves as a
 * normal block element). We deliberately do NOT set `overflow-hidden` here — clipping would hide
 * the browser-rendered resize handle in the bottom-end corner.
 */
export const textareaRecipe = cv({
  base: [
    controlBase,
    // Textarea-specific shell. `relative` anchors the absolute counter footer; `block w-full`
    // keeps the textarea a normal block element so the resize handle stays grabbable. No
    // `overflow-hidden` — see the doc comment above.
    'relative block w-full',
    'border',
    'cursor-text',
    'has-[textarea:disabled]:cursor-not-allowed has-[textarea:disabled]:opacity-50',
  ].join(' '),
  variants: {
    variant: {
      outline: 'border-border bg-bg-paper',
      solid: 'border-transparent bg-bg-subtle',
      ghost: 'border-transparent bg-transparent',
      underline: 'border-0 border-b border-border bg-transparent',
    },
    size: {
      sm: 'text-sm rounded-sm',
      md: 'text-sm rounded-md',
      lg: 'text-base rounded-lg',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
      neutral: '',
    },
    fullWidth: { true: 'w-full', false: 'w-auto' },
  },
  compoundVariants: [
    // Underline: drop the corner radius + the base focus ring (the bottom rule is the focus
    // affordance). Declared first so the per-size `rounded-*` and base `focus-within:ring-2`
    // are overridden by the variant×color rows that follow.
    { variant: 'underline', class: 'rounded-none focus-within:ring-0' },
    // 4 variants × 7 colors = 28 entries. Imported from the shared matrix — the same array Input
    // consumes. Adding a color is one edit; both surfaces pick it up.
    ...variantColorMatrix({ for: 'Textarea' }),
  ],
  defaultVariants: {
    variant: 'outline',
    size: 'md',
    color: 'primary',
    fullWidth: true,
  },
});

/**
 * Padding + line-height + `resize` story for the bare `<textarea>` element. The wrapper recipe
 * (`textareaRecipe`) carries the ring, border, and background; this one carries everything that
 * makes a multi-line surface readable.
 *
 * `resize` maps 1:1 to the native CSS `resize` property — the browser-rendered corner grip is
 * the visible affordance. When `autoResize` is on we still let the consumer pick a `resize`
 * value: a user can drag below the auto-resize ceiling unless `resize` is explicitly `'none'`.
 * The `autoResize=true` compound entry clamps the overflow to `hidden` so the natural scrollbar
 * doesn't fight with the JS-driven height changes mid-keystroke.
 */
export const textareaInnerRecipe = cv({
  base: [
    // The wrapper (`textareaRecipe`) is intentionally `block`, not `flex` (so the browser-rendered
    // resize grip in the bottom-end corner stays grabbable). That makes `grow` / `self-stretch`
    // no-ops on the inner `<textarea>`, which then collapses to its native `cols=20` intrinsic
    // width — producing the “double frame” visual where the textarea sits narrow inside its
    // wrapper. `w-full` pins the inner element to the wrapper width without re-introducing flex.
    // See `plans/bugs/textarea-alignment.md`.
    'block w-full min-w-0',
    'bg-transparent text-inherit',
    // Outline suppression has to be explicit at every focus level. In Tailwind 3 the bare
    // `outline-none` utility (`outline: 2px solid transparent`) is what *should* mask the UA
    // focus ring, but on some browsers (Safari, Chrome with system accent) the UA
    // `:focus-visible { outline: auto … }` rule wins because it specificity-ties with the
    // utility and is loaded later in the cascade. The wrapper owns the visible focus affordance
    // (`focus-within:ring-2` on outline; the bottom rule on underline) — so we explicitly hide
    // the inner element's UA outline at both `:focus` and `:focus-visible`. Without this the
    // `underline` variant paints an unwanted rectangular browser ring inside our wrapper.
    // See `plans/bugs/textarea-active-frame-mismatch.md` (Symptom B).
    'border-0 outline-none focus:outline-none focus-visible:outline-none',
    'leading-relaxed',
    'placeholder:text-fg-muted',
    'disabled:cursor-not-allowed',
    'read-only:cursor-default',
  ].join(' '),
  variants: {
    size: {
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    },
    resize: {
      none: 'resize-none',
      vertical: 'resize-y',
      horizontal: 'resize-x',
      both: 'resize',
    },
    autoResize: { true: 'overflow-hidden' },
    showCount: { true: 'pe-12' },
  },
  compoundVariants: [
    // Belt + suspenders: when auto-resize owns the height, the resize handle is meaningless on
    // the vertical axis (the textarea adjusts itself). We keep the user's stated `resize` mode
    // intact UNLESS they asked for `none`, in which case the grip stays hidden.
    { autoResize: true, resize: 'none', class: 'resize-none' },
  ],
  defaultVariants: {
    size: 'md',
    resize: 'vertical',
    autoResize: true,
  },
});

/**
 * Counter footer recipe — applied to the `<div>` that floats in the textarea's bottom-end
 * corner when `showCount` is on. Absolute-positioned + `pointer-events-none` so clicks pass
 * through to the textarea (the browser-rendered resize grip stays grabbable from the corner).
 *
 * `data-at-limit="true"` flips the text to the danger token when the consumer's `maxLength`
 * cap is hit — a small UX cue that animates via the standard transition tokens.
 */
export const textareaCountRecipe = cv({
  base: [
    'pointer-events-none absolute bottom-1 end-2 z-10',
    'text-xs text-fg-muted tabular-nums select-none',
    'transition-colors duration-fast ease-standard',
    'data-[at-limit=true]:text-danger',
  ].join(' '),
});