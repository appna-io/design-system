/**
 * Public surface for AppShell — a single component (the root) plus the `useAppShell()` hook
 * for header / sidebar consumers. No compound subparts: header / sidebar / aside / footer are
 * passed as **slot props** rather than as `<AppShell.Header>` JSX children. Rationale:
 *
 *   - Slot props let the root inspect each region's presence at render time without forcing
 *     consumers into a particular subpart shape (a `<TopBar>` from another DS still works).
 *   - The grid template is computed from "which slots are populated" — pulling that info
 *     from props is dramatically simpler than from JSX traversal of children.
 *   - It matches MUI's `<AppBar>`-era convention and Mantine's `<AppShell>` (which inspired
 *     the API), so muscle memory transfers.
 *
 * Two pure helpers (`computeGridTemplate`, `isBelowBreakpoint`) re-export for unit testing
 * and future Sidebar / NavigationMenu lanes that might want to share the same grid math.
 */
export { AppShell } from './AppShell';
export { useAppShell } from './AppShell.context';
export { computeGridTemplate } from './computeGridTemplate';
export { isBelowBreakpoint, useBreakpointBelow } from './useBreakpoint';

export type {
  AppShellBreakpoint,
  AppShellContextValue,
  AppShellHeaderVariant,
  AppShellLayout,
  AppShellMainConfig,
  AppShellMainMaxWidth,
  AppShellMainPadding,
  AppShellProps,
  AppShellSidePosition,
} from './AppShell.types';

export type { ComputeGridTemplateArgs, GridTemplate } from './computeGridTemplate';