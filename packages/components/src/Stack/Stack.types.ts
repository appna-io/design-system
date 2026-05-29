import type {
  CSSProperties,
  ElementType,
  HTMLAttributes,
  ReactNode,
  Ref,
} from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Flex direction along the main axis. `row` / `row-reverse` flow inline-start → inline-end and
 * flip correctly under `dir="rtl"` natively — no per-direction code anywhere in Stack.
 */
export type StackDirection = 'column' | 'column-reverse' | 'row' | 'row-reverse';

/**
 * Cross-axis alignment (`align-items`). `baseline` only makes sense on a row Stack; for
 * column Stacks it collapses to `start` (browser default).
 */
export type StackAlign = 'start' | 'center' | 'end' | 'stretch' | 'baseline';

/**
 * Main-axis distribution (`justify-content`). `between` / `around` / `evenly` produce the
 * three CSS distributions; `start` / `center` / `end` produce flex-start / center / flex-end.
 */
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';

/**
 * Flex-wrap behavior. `true` → `flex-wrap`, `false` → `flex-nowrap`, `'reverse'` → `flex-wrap-reverse`.
 * Single token (not split into a separate axis) because the value space is small + closed.
 */
export type StackWrap = boolean | 'reverse';

/**
 * Theme spacing-scale token. Mirrors the same numeric ladder used by Tailwind's `gap-*` utility
 * (0, px, 0.5, 1, 2, 3, 4, 5, 6, 8, 10, 12). String `'px'` covers the 1px hairline gap; numeric
 * values map 1:1 onto Tailwind's spacing scale.
 *
 * The trailing `(number & {})` is the standard TypeScript trick that keeps the literal union
 * surfaced in IntelliSense (you get autocomplete for `1`, `2`, `4`, …) while still allowing any
 * numeric value. Off-scale values silently degrade to no class — they don't crash the recipe
 * — so consumers passing `gap={5}` get `gap-5` and `gap={37}` get nothing (Tailwind doesn't
 * ship `gap-37` by default). This widening also lets downstream components (e.g. `StatGroup`)
 * forward their own free-form `ResponsiveValue<number>` into Stack without a per-consumer
 * narrowing cast.
 */
export type StackGap = 0 | 'px' | 0.5 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | (number & {});

/**
 * Spacer's auxiliary sizing token. When set, the Spacer renders a fixed-size element (using the
 * same spacing scale as `gap`) instead of the default `flex: 1` greedy spacer. Useful for paired
 * "rule of thirds" gaps inside a Stack where one gap should be larger than the rest.
 */
export type SpacerSize = StackGap;

/**
 * Axis a Spacer expands along. `'auto'` (default) takes its cue from the parent Stack's direction.
 * Override to `'inline'` (horizontal) or `'block'` (vertical) when the Spacer lives outside a
 * Stack and you still want a typed direction.
 */
export type SpacerAxis = 'auto' | 'inline' | 'block';

/**
 * Stack's render-element prop. `as` covers the 90% case (`<nav>`, `<ul>`, `<section>`, …). For the
 * rare polymorphic-with-existing-element case use `asChild` to merge Stack's props onto an
 * arbitrary existing element (typically a router `<Link>`).
 */
export type StackAs = ElementType;

/**
 * Props accepted by `<Stack>` (and inherited by `<HStack>` / `<VStack>` which lock `direction`).
 *
 * Stack is a pure layout primitive: no state, no effects, no event handlers it owns. Every prop
 * boils down to a class (or a small set of classes when responsive). Consumers retain full
 * control of state — Stack just lays things out.
 */
export interface StackProps extends Omit<HTMLAttributes<HTMLDivElement>, 'dir'> {
  /** Main axis direction. @default 'column' */
  direction?: ResponsiveValue<StackDirection> | undefined;
  /** Cross-axis alignment. @default 'stretch' */
  align?: ResponsiveValue<StackAlign> | undefined;
  /** Main-axis distribution. @default 'start' */
  justify?: ResponsiveValue<StackJustify> | undefined;
  /**
   * Gap between children (both axes). Numeric values map 1:1 onto the theme spacing scale; `'px'`
   * is a 1px hairline. Accepts `ResponsiveValue` so you can change density per breakpoint.
   * @default undefined (no gap)
   */
  gap?: ResponsiveValue<StackGap> | undefined;
  /**
   * Override gap on the row axis only. Equivalent to CSS `row-gap` / Tailwind `gap-y-*`. When set,
   * Stack emits `gap-y-{rowGap}` instead of letting `gap` cover both axes.
   */
  rowGap?: ResponsiveValue<StackGap> | undefined;
  /**
   * Override gap on the column axis only. Equivalent to CSS `column-gap` / Tailwind `gap-x-*`.
   * When set, Stack emits `gap-x-{columnGap}` instead of letting `gap` cover both axes.
   */
  columnGap?: ResponsiveValue<StackGap> | undefined;
  /** Wrap behavior. @default false */
  wrap?: StackWrap | undefined;
  /**
   * Auto-insert this node between non-Spacer siblings. Killer feature for "card" / "list" rows:
   * pass `<Divider />` once and Stack injects it n−1 times. Spacer edges are skipped (Spacers
   * already create separation).
   */
  divider?: ReactNode | undefined;
  /** Add `w-full` — useful for the 99% Stack-fills-its-container case in product UIs. */
  fullWidth?: boolean | undefined;
  /** Render `inline-flex` instead of `flex`. Useful for inline button rows. @default false */
  inline?: boolean | undefined;
  /** Render element. Defaults to `'div'`. Use semantic elements (`'nav'`, `'ul'`, …) when relevant. */
  as?: StackAs | undefined;
  /**
   * Radix-style polymorphism. Merges Stack's props onto a single child element (e.g. a router
   * Link). Cannot combine with `as` — a runtime guard fires in dev when both are set.
   */
  asChild?: boolean | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
  /** Inline style override. Wins via CSS specificity over recipe + theme classes. */
  style?: CSSProperties | undefined;
  /** Ref to the rendered element. Concrete element type depends on `as` / `asChild`. */
  ref?: Ref<HTMLElement>;
}

/**
 * Props for `<HStack>` / `<VStack>`. Same as `StackProps` minus `direction` — the wrappers lock
 * the direction so the call-site reads as the intent (`<HStack gap={2}>` reads better than
 * `<Stack direction="row" gap={2}>`).
 */
export type HVStackProps = Omit<StackProps, 'direction'>;

/**
 * Props for `<Spacer>`. Spacer is the partner primitive that produces visible separation inside a
 * Stack — `flex: 1` by default (greedy) or a fixed-size when `size` is set.
 */
export interface SpacerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Fixed size on the parent's main axis. When set, the Spacer renders a fixed-size element
   * using the theme spacing scale instead of `flex: 1`. Useful for "rule-of-thirds" layouts where
   * one gap is intentionally larger than the rest.
   */
  size?: SpacerSize | undefined;
  /**
   * Axis the Spacer expands along. `'auto'` (default) takes its cue from the parent Stack via the
   * native flex layout — no JS context lookup needed. Override when nesting Spacer outside Stack
   * or when you need the fixed-size span on the opposite axis.
   * @default 'auto'
   */
  axis?: SpacerAxis | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
  /** Inline style override. */
  style?: CSSProperties | undefined;
}
