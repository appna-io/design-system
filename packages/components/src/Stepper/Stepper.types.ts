import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/** Visual flavor of the indicator + connector strip. */
export type StepperVariant = 'numbered' | 'dots' | 'progress';

export type StepperSize = 'sm' | 'md' | 'lg';

/** Layout axis. `vertical` stacks indicators in a column with vertical connectors. */
export type StepperOrientation = 'horizontal' | 'vertical';

/** Per-step lifecycle state. Drives indicator paint, connector color, and aria messaging. */
export type StepStatus = 'pending' | 'active' | 'complete' | 'error' | 'loading';

/** Where label / description text sit relative to the indicator in horizontal mode. */
export type StepperAlign = 'start' | 'center' | 'end';

/**
 * Clickability mode.
 *  - `false` (default): steps render as plain text (no tab stop, no hover affordance).
 *  - `true`: all enabled steps are clickable (constrained by `linear` if also set).
 *  - `'completed'`: only completed steps fire `onStepClick` — common "tap a finished step
 *    to jump back" pattern.
 */
export type StepperClickable = boolean | 'completed';

/**
 * Data shape for the prop-driven array API. Each row maps 1:1 to a `<Stepper.Step>` in the
 * compound API. Consumer can override the auto-derived status per row (`error` / `loading`
 * are the common overrides; `complete` / `active` / `pending` typically derive from `active`).
 */
export interface StepData {
  /** Stable identifier — passed back through `onStepClick` so consumers know which step fired. */
  id: string;
  /** Visible label rendered next to (or under) the indicator. */
  label: ReactNode;
  /** Optional secondary line (hint, error message, sub-task summary). */
  description?: ReactNode;
  /** Override the auto-derived status (`error` / `loading` are the typical reasons). */
  status?: StepStatus | undefined;
  /** Override the indicator glyph (defaults: step number / check / alert / Spinner). */
  icon?: ReactNode | undefined;
  /** Disable the step entirely (renders muted, never clickable). */
  disabled?: boolean | undefined;
  /** Inline-vertical content slot, rendered under the indicator when the step is active. */
  content?: ReactNode | undefined;
}

/**
 * Argument shape handed to `onStepClick`. Both `id` and `index` are provided so consumers can
 * pick whichever identifier their router / wizard state prefers without an extra lookup.
 */
export interface StepperClickInfo {
  id: string;
  index: number;
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLElement>, 'color'> {
  /** Index of the currently active step (0-based). Drives default status auto-derivation. */
  active?: number | undefined;
  /** Step data for the array API. Ignored when compound `<Stepper.Step>` children are present. */
  steps?: StepData[] | undefined;
  /** Visual flavor. @default 'numbered' */
  variant?: StepperVariant | undefined;
  /** Size axis for indicator + typography + connector spacing. @default 'md' */
  size?: ResponsiveValue<StepperSize> | undefined;
  /** Layout axis. Accepts a responsive value (e.g. `{ base: 'vertical', md: 'horizontal' }`). */
  orientation?: ResponsiveValue<StepperOrientation> | undefined;
  /** Where labels sit relative to the indicator in horizontal mode. @default 'start' */
  align?: StepperAlign | undefined;
  /** Hide all step labels (compact horizontal indicator-only strip). @default true */
  showLabels?: boolean | undefined;
  /** Hide step descriptions even when present. @default true */
  showDescriptions?: boolean | undefined;
  /** Whether steps are interactive. @default false */
  clickable?: StepperClickable | undefined;
  /**
   * In linear mode, only the active step + completed steps are clickable. Pending steps beyond
   * the active one get `aria-disabled`. @default false
   */
  linear?: boolean | undefined;
  /** Fires when a clickable step is activated (mouse, touch, Enter, or Space). */
  onStepClick?: ((info: StepperClickInfo) => void) | undefined;
  /** Override the default check icon for completed steps. */
  completedIcon?: ReactNode | undefined;
  /** Override the default alert icon for error steps. */
  errorIcon?: ReactNode | undefined;
  /** Override the default Spinner for loading steps. */
  loadingIcon?: ReactNode | undefined;
  /** Custom connector node (e.g. a dashed `<Divider />`). Replaces the default rule. */
  connector?: ReactNode | undefined;
  /**
   * Accessible label for the root `<ol>`. Defaults to "Progress". When `<I18nProvider>` ships
   * this will fall back to `t('stepper.label')`; until then consumers can override via prop.
   */
  'aria-label'?: string | undefined;
  /** Compound API children — `<Stepper.Step>` elements. Ignored when `steps` is provided. */
  children?: ReactNode;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface StepperStepProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'color' | 'id'> {
  /** Stable identifier matching the `StepData.id` contract. */
  id: string;
  /** Visible label next to the indicator. */
  label: ReactNode;
  /** Optional secondary description line. */
  description?: ReactNode | undefined;
  /** Override the auto-derived status. */
  status?: StepStatus | undefined;
  /** Override the indicator glyph. */
  icon?: ReactNode | undefined;
  /** Disable this step (mutes paint + blocks click). */
  disabled?: boolean | undefined;
  /** Inline-vertical expanded content slot. Rendered under the indicator when active. */
  children?: ReactNode;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

/**
 * Resolved context flowing from `<Stepper>` to `<Stepper.Step>` subparts. Variant / size /
 * orientation / clickability are pre-resolved (non-responsive) so subparts don't re-run
 * responsive resolution per render.
 */
export interface StepperContextValue {
  activeIndex: number;
  totalSteps: number;
  variant: StepperVariant;
  size: StepperSize;
  orientation: StepperOrientation;
  align: StepperAlign;
  showLabels: boolean;
  showDescriptions: boolean;
  clickable: StepperClickable;
  linear: boolean;
  onStepClick: ((info: StepperClickInfo) => void) | undefined;
  completedIcon: ReactNode | undefined;
  errorIcon: ReactNode | undefined;
  loadingIcon: ReactNode | undefined;
  connector: ReactNode | undefined;
}