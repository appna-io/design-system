import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Stylistic family of the trigger row. Each variant defines the trigger's idle/active paint
 * plus how the active state visually advertises itself (underline / filled / pill / browser-tab).
 */
export type TabsVariant = 'underline' | 'solid' | 'pills' | 'enclosed';

export type TabsSize = 'sm' | 'md' | 'lg';

export type TabsColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/** Layout axis of the tab list. `vertical` puts the triggers in a column on the logical start. */
export type TabsOrientation = 'horizontal' | 'vertical';

/** Justification of the trigger row inside `<Tabs.List>`. `stretch` distributes triggers equally. */
export type TabsAlignment = 'start' | 'center' | 'end' | 'stretch';

/**
 * Whether arrow-key navigation **also** activates the focused tab (`automatic` — ARIA default
 * recommendation for cheap panel switches) or only moves focus until the user presses
 * Enter/Space (`manual` — for expensive panel content).
 */
export type TabsActivation = 'automatic' | 'manual';

export interface TabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'defaultValue' | 'onChange' | 'color'> {
  /** Controlled active panel value. Mirrors the `value` of one of the child `<Tabs.Trigger>`s. */
  value?: string | undefined;
  /** Uncontrolled initial active panel value. */
  defaultValue?: string | undefined;
  /** Fires with the new value whenever the active tab changes. */
  onValueChange?: ((value: string) => void) | undefined;
  /** Stylistic family of the triggers. @default 'underline' */
  variant?: ResponsiveValue<TabsVariant> | undefined;
  /** Trigger padding + font size. @default 'md' */
  size?: ResponsiveValue<TabsSize> | undefined;
  /** Semantic palette role for the active accent. @default 'primary' */
  color?: TabsColor | undefined;
  /** Layout axis. @default 'horizontal' */
  orientation?: TabsOrientation | undefined;
  /** Justification of the trigger row inside `<Tabs.List>`. @default 'start' */
  alignment?: TabsAlignment | undefined;
  /** Arrow-key activation behavior. @default 'automatic' */
  activation?: TabsActivation | undefined;
  /** Stretch the trigger row to fill its container. @default false */
  fullWidth?: boolean | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface TabsListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface TabsTriggerProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value' | 'color'> {
  /** Required — links to the matching `<Tabs.Panel value="…">`. */
  value: string;
  /** Optional leading slot, rendered before the label. */
  leftIcon?: ReactNode;
  /** Optional trailing slot, rendered after the label and any badge. */
  rightIcon?: ReactNode;
  /** Optional badge slot (e.g. unread count), rendered after the label. */
  badge?: ReactNode;
  /**
   * Render the trigger as the single child element (polymorphic). Enables wrapping a
   * `<Link>`/`<a>` for routing-driven tabs while the trigger still owns ARIA + active state.
   * @default false
   */
  asChild?: boolean | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

export interface TabsPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Required — links to the matching `<Tabs.Trigger value="…">`. */
  value: string;
  /**
   * Keep the panel mounted even when inactive. Inactive `forceMount` panels are hidden via the
   * `hidden` attribute, so layout doesn't reserve space but expensive subtrees (e.g. video
   * players that should keep playing) aren't unmounted. @default false
   */
  forceMount?: boolean | undefined;
  /** Theme-aware inline style object. */
  sx?: Sx | undefined;
}

/**
 * Wire shape carried from `<Tabs>` down to every subpart. The active value lives here; the
 * variant axes are *resolved* (non-responsive) so subparts don't need to re-run responsive
 * resolution per render.
 */
export interface TabsContextValue {
  value: string | undefined;
  setValue: (next: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  color: TabsColor;
  orientation: TabsOrientation;
  alignment: TabsAlignment;
  activation: TabsActivation;
  fullWidth: boolean;
  baseId: string;
  /**
   * Register / unregister a trigger element so the keyboard handler can locate siblings by
   * value in document order without traversing children. `null` removes the entry.
   */
  registerTrigger: (value: string, element: HTMLButtonElement | null) => void;
  /** Returns enabled trigger values in DOM order — basis for arrow / Home / End nav. */
  getOrderedEnabledValues: () => string[];
  /** Focus the trigger that matches the given value, if registered + still mounted. */
  focusValue: (value: string) => void;
}
