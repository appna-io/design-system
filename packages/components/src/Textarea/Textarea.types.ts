import type { TextareaHTMLAttributes } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

import type { InputColor, InputVariant } from '../Input/Input.types';

/**
 * Border + background story of the textarea. Aliased to `InputVariant` so the two surfaces stay
 * type-locked: adding a variant to Input adds it to Textarea, and the compiler catches any
 * recipe that misses one. This is the type-level half of the DRY commitment the shared
 * `controlBase` enforces at runtime.
 */
export type TextareaVariant = InputVariant;

export type TextareaSize = 'sm' | 'md' | 'lg';

/**
 * Color role accent for the focus ring + focused border. Aliased to `InputColor` for the same
 * reason `TextareaVariant` is aliased to `InputVariant` — single source of truth.
 */
export type TextareaColor = InputColor;

/**
 * Multi-line-specific knob: how the consumer can manually resize the textarea. Distinct from
 * `autoResize` (which grows the box with content). Mapped 1:1 to the native CSS `resize`
 * property; `'both'` works through `autoResize` when the user drags below the auto-resize
 * ceiling, so the two props compose cleanly.
 */
export type TextareaResize = 'none' | 'vertical' | 'horizontal' | 'both';

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'color' | 'rows'> {
  /** Border + background story. @default 'outline' */
  variant?: ResponsiveValue<TextareaVariant> | undefined;
  /** Vertical padding + font-size scale. @default 'md' */
  size?: ResponsiveValue<TextareaSize> | undefined;
  /** Accent for the focus ring + focused border. @default 'primary' */
  color?: ResponsiveValue<TextareaColor> | undefined;
  /** Stretch to fill the parent's inline-size. @default true */
  fullWidth?: ResponsiveValue<boolean> | undefined;
  /** Visual + `aria-invalid` invalid state. Wins over the active `color` for border + ring. */
  invalid?: boolean | undefined;
  /**
   * Initial visible row count. Used as the textarea's natural height before `autoResize` kicks
   * in. When `autoResize` is off this is the static height.
   * @default 3
   */
  rows?: number | undefined;
  /**
   * Floor for `autoResize`. The textarea won't shrink below this many lines regardless of how
   * empty it gets. Defaults to `rows`.
   */
  minRows?: number | undefined;
  /**
   * Ceiling for `autoResize`. Once content exceeds this many lines the textarea stops growing
   * and an internal scrollbar takes over. Omit for no ceiling.
   */
  maxRows?: number | undefined;
  /**
   * Grow the textarea with its content. Off-the-shelf modern UX — opt out only for fixed-height
   * layouts where the surrounding chrome shouldn't shift.
   * @default true
   */
  autoResize?: boolean | undefined;
  /**
   * Manual resize affordance. The native CSS `resize` property: `'none'` hides the corner grip,
   * `'vertical'` (default) is the modal expectation, `'horizontal'` is unusual, `'both'` is the
   * browser default.
   * @default 'vertical'
   */
  resize?: TextareaResize | undefined;
  /**
   * Render the bottom-end character counter. Pairs naturally with `maxLength` — when both are
   * present the counter reads `current / max` and flips `data-at-limit` once the cap is hit.
   * Without `maxLength`, just the current length is shown.
   */
  showCount?: boolean | undefined;
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}