import type { HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family. Four "background + border + text" stories cover the conventional alert
 * spectrum from "loud announcement" (`solid`) to "minimal inline note" (`inline`).
 */
export type AlertVariant = 'solid' | 'outline' | 'soft' | 'inline';

/**
 * Status palette. Deliberately **5-of-7** — brand colors (`primary`, `secondary`) are excluded
 * because alerts speak about *what happened* (`info` / `success` / `warning` / `danger`) or
 * *here's a note* (`neutral`). Forcing brand into status semantics leads to UI drift.
 */
export type AlertColor = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

export type AlertSize = 'sm' | 'md' | 'lg';

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'role'> {
  /** Stylistic family. @default 'soft' */
  variant?: ResponsiveValue<AlertVariant> | undefined;
  /** Status color. @default 'info' */
  color?: AlertColor | undefined;
  /** Visual size. @default 'md' */
  size?: ResponsiveValue<AlertSize> | undefined;
  /** Overrides the auto-selected leading icon for the active `color`. */
  icon?: ReactNode;
  /** Hide the leading icon entirely. @default false */
  hideIcon?: boolean | undefined;
  /** Render a built-in `×` dismiss button on the trailing edge. @default false */
  closable?: boolean | undefined;
  /** Fired when the alert is dismissed (via the close button or controlled `open=false`). */
  onClose?: (() => void) | undefined;
  /** Controlled visibility. Pair with `onClose`. */
  open?: boolean | undefined;
  /** Initial visibility for the uncontrolled flow. @default true */
  defaultOpen?: boolean | undefined;
  /**
   * Live-region role override. Auto-selects based on `color` — info / success / neutral get
   * `status` (polite), warning / danger get `alert` (assertive). Only override when intentional.
   */
  role?: 'status' | 'alert' | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface AlertTitleProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

export interface AlertDescriptionProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

export interface AlertActionProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}