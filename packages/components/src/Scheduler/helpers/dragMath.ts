import {
  addDays,
  addMinutes,
  MINUTES_PER_DAY,
  MINUTES_PER_HOUR,
  snapMinute,
  startOfDay,
  withTime,
} from './dateMath';

/**
 * Pointer → time conversion. The drag layer in the views calls these from `onPointerMove`
 * so the preview event tracks the cursor with sub-frame latency.
 */

/**
 * Convert a vertical pixel offset within a day column into a `Date` (clamped + snapped).
 *
 * `containerTop` is the `getBoundingClientRect().top` of the day's `<div>` (the part of the
 * grid for that column, excluding the all-day band and header). `hourHeight` is the
 * configured rendering pitch in px-per-hour.
 */
export interface PointerToTimeOptions {
  pointerY: number;
  containerTop: number;
  hourHeight: number;
  dayAnchor: Date;
  snapMinutes: number;
}

export function pointerToTime(opts: PointerToTimeOptions): Date {
  const { pointerY, containerTop, hourHeight, dayAnchor, snapMinutes } = opts;
  const offset = Math.max(0, pointerY - containerTop);
  const rawMinute = (offset / hourHeight) * MINUTES_PER_HOUR;
  const snapped = snapMinute(rawMinute, snapMinutes);
  return addMinutes(startOfDay(dayAnchor), snapped);
}

/**
 * Convert a horizontal pixel offset across a multi-column day row into a day anchor.
 *
 * `containerLeft` is the `getBoundingClientRect().left` of the entire week's grid (the row
 * that holds N day columns). `dayWidth` is the px width of each day column. The first day
 * of the visible range is `firstDay`.
 *
 * RTL: the caller should flip the X axis before calling (subtract pointerX from
 * `containerLeft + dayWidth * dayCount`).
 */
export interface PointerToDayOptions {
  pointerX: number;
  containerLeft: number;
  dayWidth: number;
  firstDay: Date;
  dayCount: number;
}

export function pointerToDay(opts: PointerToDayOptions): Date {
  const { pointerX, containerLeft, dayWidth, firstDay, dayCount } = opts;
  if (dayWidth <= 0) return firstDay;
  const offset = Math.max(0, pointerX - containerLeft);
  const index = Math.min(dayCount - 1, Math.floor(offset / dayWidth));
  return addDays(startOfDay(firstDay), index);
}

/**
 * Combined helper — pointer → `(day, time)` in one call. Used for drag-to-create in
 * week / day / multiDay views.
 */
export interface PointerToDateTimeOptions {
  pointerX: number;
  pointerY: number;
  containerRect: { top: number; left: number; width: number; height: number };
  hourHeight: number;
  snapMinutes: number;
  firstDay: Date;
  dayCount: number;
  dayWidth: number;
}

export function pointerToDateTime(opts: PointerToDateTimeOptions): Date {
  const day = pointerToDay({
    pointerX: opts.pointerX,
    containerLeft: opts.containerRect.left,
    dayWidth: opts.dayWidth,
    firstDay: opts.firstDay,
    dayCount: opts.dayCount,
  });
  return pointerToTime({
    pointerY: opts.pointerY,
    containerTop: opts.containerRect.top,
    hourHeight: opts.hourHeight,
    dayAnchor: day,
    snapMinutes: opts.snapMinutes,
  });
}

/**
 * Drag-create geometry: from a `(anchor, current)` pointer-time pair, produce a
 * `{ start, end }` slot that's always normalized (start ≤ end) and at least
 * `minimumDurationMinutes` long.
 */
export function dragRange(
  anchorTime: Date,
  currentTime: Date,
  minimumDurationMinutes = 15,
): { start: Date; end: Date } {
  const a = anchorTime.getTime();
  const c = currentTime.getTime();
  if (c >= a) {
    const start = anchorTime;
    let end = currentTime;
    if (end.getTime() - start.getTime() < minimumDurationMinutes * 60_000) {
      end = addMinutes(start, minimumDurationMinutes);
    }
    return { start, end };
  }
  const start = currentTime;
  let end = anchorTime;
  if (end.getTime() - start.getTime() < minimumDurationMinutes * 60_000) {
    end = addMinutes(start, minimumDurationMinutes);
  }
  return { start, end };
}

/**
 * Apply a move-delta to an event's `{ start, end }`. `deltaMinutes` is the pointer-derived
 * vertical drift (positive = later in the day); `deltaDays` is the horizontal drift in day
 * columns. Both axes are snapped before the delta is applied so the previewed event
 * always lands on the grid.
 */
export function applyMoveDelta(
  start: Date,
  end: Date,
  deltaMinutes: number,
  deltaDays: number,
  snapMinutes: number,
): { start: Date; end: Date } {
  const duration = end.getTime() - start.getTime();
  const snappedMinutes = snapMinute(deltaMinutes, snapMinutes) * Math.sign(deltaMinutes || 1);
  // Compose: add days first (DST-safe), then shift minutes.
  const movedDay = addDays(start, deltaDays);
  const movedStart = addMinutes(
    withTime(movedDay, start.getHours(), start.getMinutes(), start.getSeconds()),
    snappedMinutes,
  );
  const movedEnd = new Date(movedStart.getTime() + duration);
  return { start: movedStart, end: movedEnd };
}

/**
 * Apply a resize edge delta. `edge` = `'start'` shifts the start (and keeps end pinned),
 * `'end'` shifts the end (keeps start pinned). Always honors `snapMinutes` and guarantees
 * the resulting interval is at least `minimumDurationMinutes` long.
 */
export function applyResizeDelta(
  start: Date,
  end: Date,
  deltaMinutes: number,
  edge: 'start' | 'end',
  snapMinutes: number,
  minimumDurationMinutes = 15,
): { start: Date; end: Date } {
  const snapped = snapMinute(Math.abs(deltaMinutes), snapMinutes) * Math.sign(deltaMinutes || 1);
  if (edge === 'end') {
    let nextEnd = addMinutes(end, snapped);
    const minEnd = addMinutes(start, minimumDurationMinutes);
    if (nextEnd.getTime() < minEnd.getTime()) nextEnd = minEnd;
    // Clamp into the day to avoid resize wrapping past midnight (multi-day events use
    // splitAtMidnight on render — resizing across midnight is a V2 concern).
    return { start, end: nextEnd };
  }
  let nextStart = addMinutes(start, snapped);
  const maxStart = addMinutes(end, -minimumDurationMinutes);
  if (nextStart.getTime() > maxStart.getTime()) nextStart = maxStart;
  if (nextStart.getDate() !== start.getDate()) nextStart = start;
  return { start: nextStart, end };
}

export { MINUTES_PER_DAY };