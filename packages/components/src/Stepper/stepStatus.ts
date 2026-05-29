import type { StepStatus } from './Stepper.types';

/**
 * Pure resolver for a single step's visual status. Pulled out of the React tree so the truth
 * table is testable in isolation (matches the `computeVisibleItems` / `useTabsKeyboard` /
 * `stackChildrenWithDivider` convention — small pure helpers earn standalone tests).
 *
 * Rules (in priority order):
 *  1. **Explicit `error` / `loading` / `complete` always wins** — consumer knows something we
 *     don't (validation failed, async work in-flight, manually marked done).
 *  2. **Explicit `active`** is only honored when it lines up with `activeIndex`. If a consumer
 *     marks step 2 as `active` while `active === 0`, we treat it as `pending` (so the visual
 *     stays consistent with the consumer's own active index).
 *  3. **Explicit `pending`** is a no-op — same as letting auto-derivation run. Lets consumers
 *     pass `status: undefined` and `status: 'pending'` interchangeably without surprises.
 *  4. **Auto from `activeIndex`** otherwise: `index < activeIndex` → complete, `=== activeIndex`
 *     → active, `> activeIndex` → pending.
 *
 * A step marked `disabled` is *not* coerced here — disabled is an orthogonal axis that the
 * renderer paints by masking + blocking clicks; the underlying status still matters for
 * connector color ("step 2 is disabled but completed" looks different from "disabled + pending").
 */
export function resolveStepStatus(args: {
  index: number;
  activeIndex: number;
  explicit?: StepStatus | undefined;
}): StepStatus {
  const { index, activeIndex, explicit } = args;

  if (explicit === 'error' || explicit === 'loading' || explicit === 'complete') {
    return explicit;
  }

  if (explicit === 'active') {
    if (index === activeIndex) return 'active';
    return index < activeIndex ? 'complete' : 'pending';
  }

  if (index < activeIndex) return 'complete';
  if (index === activeIndex) return 'active';
  return 'pending';
}

/**
 * Status that paints the connector *after* a given step. Visually the line "fills in" as the
 * user advances, so the connector mirrors the step it follows rather than the step it precedes.
 *
 *  - After a `complete` step → the connector is `complete` (filled).
 *  - After an `active` step  → the connector is `active` (highlighted, signals progress).
 *  - After an `error` step   → the connector is `error` (red, draws the eye to the failure).
 *  - After `loading` step    → still `active` paint (work-in-progress isn't a connector concern).
 *  - After `pending` step    → connector stays `pending` (muted).
 *
 * Returns only the four statuses the connector recipe knows about — `loading` collapses to
 * `active` because the connector itself never spins.
 */
export function resolveConnectorStatus(stepStatus: StepStatus): 'complete' | 'active' | 'pending' | 'error' {
  if (stepStatus === 'complete') return 'complete';
  if (stepStatus === 'active' || stepStatus === 'loading') return 'active';
  if (stepStatus === 'error') return 'error';
  return 'pending';
}

/**
 * Whether a step at `index` is allowed to fire `onStepClick` for the current props. Pulled out
 * so both the click handler and the rendered button's `aria-disabled` / `disabled` attributes
 * agree without duplicating the rules in two places.
 */
export function isStepClickable(args: {
  index: number;
  activeIndex: number;
  status: StepStatus;
  clickable: boolean | 'completed';
  linear: boolean;
  disabled: boolean;
}): boolean {
  const { index, activeIndex, status, clickable, linear, disabled } = args;
  if (disabled) return false;
  if (clickable === false) return false;
  if (clickable === 'completed') return status === 'complete';
  if (linear) {
    // Allow returning to completed steps and the currently active one; pending blocked.
    return index <= activeIndex;
  }
  return true;
}
