import type {
  CalendarSource,
  SchedulerColor,
  SchedulerEvent,
} from '../Scheduler.types';

/**
 * Resolve the rendered color of an event. Precedence (highest → lowest):
 *
 *   1. `event.color` — per-event override.
 *   2. `calendar.color` — calendar default for the event's `calendarId`.
 *   3. The Scheduler's root `color` prop.
 *
 * The return is either one of the DS color roles (which the recipe maps to tokens) or a
 * raw CSS color string (which the renderer applies via `style`).
 */
export function resolveEventColor(
  event: SchedulerEvent,
  calendarById: ReadonlyMap<string, CalendarSource>,
  fallback: SchedulerColor,
): SchedulerColor | string {
  if (event.color) return event.color;
  if (event.calendarId) {
    const cal = calendarById.get(event.calendarId);
    if (cal?.color) return cal.color;
  }
  return fallback;
}

/**
 * Test whether a value is one of the recipe's 7 named color roles. The renderer uses this
 * to decide whether to forward `color` to the recipe (named) or to a `style={{ ... }}`
 * payload (custom).
 */
const COLOR_ROLES: ReadonlySet<string> = new Set([
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
]);

export function isNamedColor(value: string): value is SchedulerColor {
  return COLOR_ROLES.has(value);
}
