'use client';

import { useSlotClass } from '../helpers/useSlotClass';
import {
  forwardRef,
  useMemo,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';

import type {
  PositionedEvent,
  SchedulerEvent,
} from '../Scheduler.types';
import {
  schedulerEventRecipe,
  schedulerEventResizeHandleRecipe,
  schedulerEventTimeRecipe,
  schedulerEventTitleRecipe,
} from '../Scheduler.recipe';
import { useSchedulerContext } from '../SchedulerContext';
import { isNamedColor, resolveEventColor } from '../helpers/eventColor';
import { formatTime } from '../helpers/formatTime';

export interface SchedulerEventCardProps {
  event: SchedulerEvent;
  /** Computed layout payload — kept on the public API so consumers replacing the
   *  card via `renderEvent` get the same metadata the default card uses. */
  positioned: PositionedEvent;
  isSelected?: boolean;
  isGhost?: boolean;
  asAllDay?: boolean;
  /** Render-slot escape hatch — when present, replaces the card body entirely. */
  children?: ReactNode;
  style?: CSSProperties;
  onClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onDoubleClick?: (event: MouseEvent<HTMLButtonElement>) => void;
  onResizeStart?: (edge: 'start' | 'end') => void;
}

/**
 * The default event card. Renders the event's color-resolved chrome + title + time range.
 *
 * Three pieces of state are reflected via `data-*` attributes:
 *   - `data-state="open|closed"` matches Popover for selector-based styling.
 *   - `data-ghost="true"` during a drag.
 *   - `data-allday="true"` for all-day band rendering.
 *
 * Consumers can replace the entire card via `renderEvent` on the root, or just style the
 * defaults via theme overrides on the `schedulerEventRecipe` slot.
 */
export const SchedulerEventCard = forwardRef<HTMLButtonElement, SchedulerEventCardProps>(
  function SchedulerEventCard(props, ref) {
    const {
      event,
      positioned: _positioned,
      isSelected = false,
      isGhost = false,
      asAllDay = false,
      children,
      style,
      onClick,
      onDoubleClick,
      onResizeStart,
    } = props;
    void _positioned;

    const ctx = useSchedulerContext();
    const { eventShape, color: rootColor, locale, timeFormat, enableDragResize, t } = ctx;
    const density = ctx.state.density;

    const resolved = resolveEventColor(event, ctx.calendarById, rootColor);
    const namedColor = typeof resolved === 'string' && isNamedColor(resolved)
      ? resolved
      : rootColor;
    const customColorStyle: CSSProperties | undefined =
      typeof resolved === 'string' && !isNamedColor(resolved)
        ? { backgroundColor: resolved, color: '#fff', borderColor: resolved }
        : undefined;

    const classes = useSlotClass(
      'scheduler.event',
      schedulerEventRecipe,
      {
        shape: eventShape,
        variant: asAllDay ? 'soft' : 'soft',
        color: namedColor,
        density,
        isSelected,
        isGhost,
        allDay: asAllDay,
        interactive: ctx.canEditEvent(event) || !!onClick,
      },
    );

    const titleClasses = useSlotClass(
      'scheduler.event.title',
      schedulerEventTitleRecipe,
      {},
    );
    const timeClasses = useSlotClass('scheduler.event.time', schedulerEventTimeRecipe, {});

    const resizeStartClasses = useSlotClass(
      'scheduler.event.resize',
      schedulerEventResizeHandleRecipe,
      { edge: 'start' as const },
    );
    const resizeEndClasses = useSlotClass(
      'scheduler.event.resize',
      schedulerEventResizeHandleRecipe,
      { edge: 'end' as const },
    );

    const ariaLabel = useMemo(() => t.eventAriaLabel(event), [t, event]);

    const handleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick?.(e as unknown as MouseEvent<HTMLButtonElement>);
      }
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={ariaLabel}
        aria-pressed={isSelected || undefined}
        data-allday={asAllDay || undefined}
        data-ghost={isGhost || undefined}
        data-state={isSelected ? 'open' : 'closed'}
        className={classes}
        style={{ ...customColorStyle, ...style }}
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onKeyDown={handleKey}
      >
        {children ?? (
          <>
            <span className={titleClasses}>{event.title || t.untitledEvent}</span>
            {!asAllDay && !event.allDay && (
              <span className={timeClasses}>
                {formatTime(event.start, locale, timeFormat)}
                {' – '}
                {formatTime(event.end, locale, timeFormat)}
              </span>
            )}
            {asAllDay && event.location && (
              <span className={timeClasses}>{event.location}</span>
            )}
          </>
        )}
        {!asAllDay && enableDragResize && ctx.canEditEvent(event) && (
          <>
            <span
              aria-hidden
              className={resizeStartClasses}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeStart?.('start');
              }}
            />
            <span
              aria-hidden
              className={resizeEndClasses}
              onPointerDown={(e) => {
                e.stopPropagation();
                onResizeStart?.('end');
              }}
            />
          </>
        )}
      </button>
    );
  },
);

SchedulerEventCard.displayName = 'Scheduler.EventCard';

void positionedToInlineStyle;
function positionedToInlineStyle(_: PositionedEvent): CSSProperties {
  return {};
}