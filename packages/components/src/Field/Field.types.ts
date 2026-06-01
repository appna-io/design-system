import type { Sx } from '@apx-ui/engine';
import type {
  CSSProperties,
  HTMLAttributes,
  LabelHTMLAttributes,
  ReactNode,
  Ref,
} from 'react';

/** Visual size scale — propagates to the wrapped form control via `FieldContext.size`. */
export type FieldSize = 'sm' | 'md' | 'lg';

/**
 * Where the label sits relative to the control.
 *
 * - `top`      — default; label above the control (stacked column layout).
 * - `start`    — horizontal "form row": label on the leading inline edge with optional `labelWidth`.
 * - `floating` — Material-style label that sits inside the control border and collapses up on
 *   focus / value. Pure CSS implementation via `:placeholder-shown`; requires the inner control
 *   to render a `placeholder` (Input / Textarea / NumberInput / Combobox).
 * - `hidden`   — label is visually hidden (`sr-only`) but still associated for screen-readers.
 */
export type FieldLabelPosition = 'top' | 'start' | 'floating' | 'hidden';

/** Container element. `fieldset` enables `<legend>` semantics for multi-control groups. */
export type FieldAs = 'div' | 'fieldset';

/**
 * Shared base used by Field's root and its 5 subparts. Mirrors the cross-component convention of
 * piping `className` / `style` / `sx` through `useThemedClasses`.
 */
export interface FieldBaseProps {
  className?: string;
  style?: CSSProperties;
  sx?: Sx;
}

/**
 * Props for the `<Field>` root.
 *
 * Field is intentionally a *wrapper*, not a fork of every form control. The control's own
 * `label` / `error` / `helperText` / `id` / `required` / etc. props continue to work standalone;
 * when wrapped in `<Field>`, the Field's same-named props win and propagate to the inner control
 * via `FieldContext` (consumed by the shared `useFormFieldA11y` hook).
 */
export interface FieldProps
  extends FieldBaseProps,
    Omit<HTMLAttributes<HTMLElement>, 'children' | 'color'> {
  /** Visible label. Rendered into `<Field.Label>` (or `<legend>` when `as="fieldset"`). */
  label?: ReactNode;
  /** Position of the label relative to the control. Default `'top'`. */
  labelPosition?: FieldLabelPosition;
  /**
   * CSS length applied to the label column when `labelPosition='start'`. Ignored otherwise.
   * Accepts any CSS length token (`'120px'`, `'8rem'`, `'30%'`, …).
   */
  labelWidth?: string;
  /** Trailing addon rendered after the label text (e.g. a `<Badge>` or info `<Tooltip>`). */
  labelAddon?: ReactNode;
  /**
   * Marks the field as required. Renders a red `*` indicator after the label (aria-hidden) and
   * sets `aria-required="true"` on the inner control via context.
   */
  required?: boolean;
  /**
   * Marks the field as explicitly optional. Renders a muted "(optional)" hint after the label.
   * Mutually exclusive with `required` (Field warns in dev when both are set).
   */
  optional?: boolean;
  /** Hide the `*` indicator even when `required={true}` (still sets `aria-required`). */
  hideRequiredIndicator?: boolean;
  /**
   * Long-form guidance rendered between the label and the control. Maps to `<Field.Description>`
   * and is wired into the inner control's `aria-describedby`.
   */
  description?: ReactNode;
  /**
   * Short hint rendered below the control. Maps to `<Field.Helper>`. Wired into the inner
   * control's `aria-describedby`. Hidden when `error` is non-falsy.
   */
  helperText?: ReactNode;
  /**
   * Error message rendered below the control (replaces `helperText` when present). Sets
   * `aria-invalid="true"` and wires into the inner control's `aria-describedby`.
   */
  error?: ReactNode;
  /**
   * `id` for the inner control. When omitted, Field generates a stable id via `useId` and the
   * inner control reads it from context (replacing its own auto-id).
   */
  htmlFor?: string;
  /** Propagated to the inner control via context. */
  name?: string;
  /** Container element. `'fieldset'` auto-routes the label into a `<legend>`. Default `'div'`. */
  as?: FieldAs;
  /** Visual size — propagates to the inner control. Default `'md'`. */
  size?: FieldSize;
  /** Propagates to the inner control via context. */
  disabled?: boolean;
  /** Propagates to the inner control via context. */
  readOnly?: boolean;
  /** Visual icon / text BEFORE the control row (inside the field layout). */
  startAdornment?: ReactNode;
  /** Visual icon / text AFTER the control row (inside the field layout). */
  endAdornment?: ReactNode;
  /** Forwarded to the underlying `<div>` / `<fieldset>` root. */
  ref?: Ref<HTMLElement>;
  /** Field children — typically the form control, optionally interleaved with `<Field.*>` subparts. */
  children?: ReactNode;
}

/** Props for `<Field.Label>`. */
export interface FieldLabelProps
  extends FieldBaseProps,
    Omit<LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> {
  /**
   * Override the auto-wired `htmlFor`. Normally Field provides this through context; consumers
   * only pass it when rendering a Label outside the standard control-association flow.
   */
  htmlFor?: string;
  children?: ReactNode;
}

/** Props for `<Field.Description>`. */
export interface FieldDescriptionProps
  extends FieldBaseProps,
    Omit<HTMLAttributes<HTMLParagraphElement>, 'children'> {
  children?: ReactNode;
}

/** Props for `<Field.Helper>`. */
export interface FieldHelperProps
  extends FieldBaseProps,
    Omit<HTMLAttributes<HTMLParagraphElement>, 'children'> {
  children?: ReactNode;
}

/** Props for `<Field.Error>`. */
export interface FieldErrorProps
  extends FieldBaseProps,
    Omit<HTMLAttributes<HTMLParagraphElement>, 'children'> {
  children?: ReactNode;
}

/**
 * Props for `<Field.Control>`. Optional explicit slot marker for layouts that need to mix
 * adornments around the control on the same row. When omitted, children are rendered inline.
 */
export interface FieldControlProps
  extends FieldBaseProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  children?: ReactNode;
}

/**
 * Shape published on `FieldContext`. Consumed by the shared `useFormFieldA11y` hook and by
 * `<Field.Label>` / `<Field.Description>` / `<Field.Helper>` / `<Field.Error>` subparts.
 *
 * The fields starting with `_` are subpart-discovery flags — Field uses them to know whether the
 * consumer rendered explicit subparts (via the compound API) or relied on prop-driven defaults.
 */
export interface FieldContextValue {
  /**
   * Stable id of the inner form control. Always set. When `groupMode` is `true`, controls
   * **should not** consume this id (it would collide across multiple grouped controls) — the
   * shared `useFormFieldA11y` hook respects that automatically.
   */
  id: string;
  /**
   * `true` when `<Field as="fieldset">` is in use, i.e. multiple controls share the wrapper.
   * The shared `useFormFieldA11y` hook skips id + describedBy propagation in this mode to avoid
   * id collisions across grouped controls — the fieldset/legend pair carries the labeling and
   * each control keeps its own auto-generated id.
   */
  groupMode: boolean;
  /** Optional `name` attribute propagated to the inner control. */
  name: string | undefined;
  /** `true` when the field is required. */
  required: boolean;
  /** `true` when an explicit `error` prop is set. */
  invalid: boolean;
  /** `true` when the field is disabled. */
  disabled: boolean;
  /** `true` when the field is read-only. */
  readOnly: boolean;
  /** Resolved size, propagated to the inner control. */
  size: FieldSize;
  /** Resolved label position. */
  labelPosition: FieldLabelPosition;
  /** Auto-generated id for the description paragraph. Only attached when description renders. */
  descriptionId: string;
  /** Auto-generated id for the helper paragraph. Only attached when helper renders. */
  helperId: string;
  /** Auto-generated id for the error paragraph. Only attached when error renders. */
  errorId: string;
  /**
   * Pre-composed `aria-describedby` value (description id + helper id + error id joined by space,
   * in that order). `undefined` when none of the three render.
   */
  describedBy: string | undefined;
  /**
   * `true` after the consumer (or Field root itself) has rendered a `<Field.Description>`.
   * Subparts toggle this so the root can fall back to prop-driven defaults when missing.
   */
  hasDescription: boolean;
  /** `true` after a `<Field.Helper>` has rendered. */
  hasHelper: boolean;
  /** `true` after a `<Field.Error>` has rendered. */
  hasError: boolean;
}