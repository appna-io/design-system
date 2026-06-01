'use client';

import { forwardRef, useId } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import {
  Children,
  isValidElement,
  useCallback,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';

import { formatTimestamp } from './formatTimestamp';
import {
  TimelineContext,
  TimelineItemContext,
  useTimelineContext,
  useTimelineItemContext,
} from './Timeline.context';
import {
  timelineConnectorRecipe,
  timelineContentRecipe,
  timelineDescriptionRecipe,
  timelineDotRecipe,
  timelineIndicatorRecipe,
  timelineItemRecipe,
  timelineMediaRecipe,
  timelineRecipe,
  timelineTimestampRecipe,
  timelineTitleRecipe,
} from './Timeline.recipe';
import type {
  TimelineItemData,
  TimelineItemProps,
  TimelineProps,
  TimelineSubcomponentProps,
} from './Timeline.types';

/* -------------------------------------------------------------------------- */
/*  Compound subcomponents                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Title slot. When the parent `<Timeline collapsible>` is set, the title renders as a
 * `<button>` with `aria-expanded` + `aria-controls` so screen readers announce the disclosure.
 * Otherwise it stays a `<span>` — Timeline titles are content, not headings, and we don't want
 * to silently inject an `<h3>` that fights the consumer's outline.
 */
function TimelineTitle({ children, className, style }: TimelineSubcomponentProps): ReactElement {
  const { size, collapsible, onItemClick } = useTimelineContext();
  const item = useTimelineItemContext();
  const interactive = collapsible || Boolean(onItemClick);

  const { className: titleClass } = useThemedClasses({
    recipe: timelineTitleRecipe,
    componentName: 'Timeline',
    slot: 'title',
    props: { size, interactive, className },
  });

  if (interactive && item) {
    return (
      <button
        type="button"
        id={item.titleId}
        className={titleClass}
        style={style}
        data-timeline-title=""
        aria-expanded={collapsible ? item.expanded : undefined}
        aria-controls={collapsible ? item.descriptionId : undefined}
        onClick={() => {
          if (collapsible && item.toggleExpanded) item.toggleExpanded();
          if (onItemClick) onItemClick(item.id);
        }}
      >
        {children}
      </button>
    );
  }

  return (
    <span
      id={item?.titleId}
      className={titleClass}
      style={style}
      data-timeline-title=""
    >
      {children}
    </span>
  );
}
TimelineTitle.displayName = 'Timeline.Title';

function TimelineDescription({
  children,
  className,
  style,
}: TimelineSubcomponentProps): ReactElement | null {
  const { size, collapsible } = useTimelineContext();
  const item = useTimelineItemContext();
  const { className: descClass } = useThemedClasses({
    recipe: timelineDescriptionRecipe,
    componentName: 'Timeline',
    slot: 'description',
    props: { size, className },
  });

  if (collapsible && item && !item.expanded) return null;

  return (
    <p
      id={item?.descriptionId}
      className={descClass}
      style={style}
      data-timeline-description=""
    >
      {children}
    </p>
  );
}
TimelineDescription.displayName = 'Timeline.Description';

function TimelineMedia({
  children,
  className,
  style,
}: TimelineSubcomponentProps): ReactElement | null {
  const { collapsible } = useTimelineContext();
  const item = useTimelineItemContext();
  const { className: mediaClass } = useThemedClasses({
    recipe: timelineMediaRecipe,
    componentName: 'Timeline',
    slot: 'media',
    props: { className },
  });

  if (collapsible && item && !item.expanded) return null;

  return (
    <div className={mediaClass} style={style} data-timeline-media="">
      {children}
    </div>
  );
}
TimelineMedia.displayName = 'Timeline.Media';

interface TimelineTimestampOwnProps extends TimelineSubcomponentProps {
  /** Override the timestamp value. Falls back to the value passed on `Timeline.Item`. */
  value?: Date | string | null;
}

function TimelineTimestamp({
  value,
  children,
  className,
  style,
}: TimelineTimestampOwnProps): ReactElement | null {
  const { size, timestampFormat, locale, showTimestamps } = useTimelineContext();
  const { className: tsClass } = useThemedClasses({
    recipe: timelineTimestampRecipe,
    componentName: 'Timeline',
    slot: 'timestamp',
    props: { size, className },
  });

  if (!showTimestamps) return null;

  // Manual override via children takes priority over auto-formatting.
  if (children) {
    return (
      <span className={tsClass} style={style} data-timeline-timestamp="">
        {children}
      </span>
    );
  }

  const formatted = formatTimestamp({
    value: value ?? null,
    format: timestampFormat,
    ...(locale !== undefined ? { locale } : {}),
  });

  if (formatted.text === null) return null;

  // Use `<time>` when we have an ISO datetime (real Date input); fall back to `<span>` for
  // string passthroughs so we don't mint an invalid `dateTime` attribute.
  if (formatted.isoDateTime !== null) {
    return (
      <time
        className={tsClass}
        style={style}
        dateTime={formatted.isoDateTime}
        data-timeline-timestamp=""
      >
        {formatted.text}
      </time>
    );
  }

  return (
    <span className={tsClass} style={style} data-timeline-timestamp="">
      {formatted.text}
    </span>
  );
}
TimelineTimestamp.displayName = 'Timeline.Timestamp';

function TimelineConnector({
  className,
  style,
}: TimelineSubcomponentProps): ReactElement {
  const { orientation } = useTimelineContext();
  const { className: connectorClass } = useThemedClasses({
    recipe: timelineConnectorRecipe,
    componentName: 'Timeline',
    slot: 'connector',
    props: { orientation, className },
  });
  return (
    <span
      aria-hidden="true"
      className={connectorClass}
      style={style}
      data-timeline-connector=""
    />
  );
}
TimelineConnector.displayName = 'Timeline.Connector';

/* -------------------------------------------------------------------------- */
/*  Timeline.Item                                                             */
/* -------------------------------------------------------------------------- */

/**
 * One event row. Owns the indicator (dot + connector), the optional auto-rendered timestamp,
 * and the content slot. The connector is hidden on the last item via the parent's
 * `[&:last-child_[data-timeline-connector]]:hidden` rule.
 *
 * When the parent Timeline has `collapsible`, the item also owns expansion state — exposed via
 * `TimelineItemContext` so `Timeline.Title` can wire the toggle button and `Timeline.Description`
 * + `Timeline.Media` can conditionally render.
 */
function TimelineItem({
  id,
  icon,
  tone = 'neutral',
  active = false,
  timestamp,
  children,
  className,
  style,
}: TimelineItemProps): ReactElement {
  const { orientation, layout, size, collapsible } = useTimelineContext();
  const generatedId = useId();
  const itemId = id ?? generatedId;
  const titleId = `${itemId}-title`;
  const descriptionId = `${itemId}-description`;

  const [expanded, setExpanded] = useState<boolean>(!collapsible);
  const toggleExpanded = useCallback(() => setExpanded((v) => !v), []);

  const { className: itemClass, style: itemStyle } = useThemedClasses({
    recipe: timelineItemRecipe,
    componentName: 'Timeline',
    slot: 'item',
    props: { orientation, layout, size, className, style },
  });
  const { className: indicatorClass } = useThemedClasses({
    recipe: timelineIndicatorRecipe,
    componentName: 'Timeline',
    slot: 'indicator',
    props: { orientation },
  });
  const { className: dotClass } = useThemedClasses({
    recipe: timelineDotRecipe,
    componentName: 'Timeline',
    slot: 'dot',
    props: { size, tone, active },
  });
  const { className: contentClass } = useThemedClasses({
    recipe: timelineContentRecipe,
    componentName: 'Timeline',
    slot: 'content',
    props: { size },
  });

  const itemContext = {
    id: itemId,
    tone,
    active,
    expanded,
    toggleExpanded: collapsible ? toggleExpanded : undefined,
    titleId,
    descriptionId,
  };

  return (
    <li
      className={itemClass}
      style={itemStyle ?? undefined}
      data-timeline-item=""
      data-tone={tone}
      data-active={active ? 'true' : 'false'}
      aria-current={active ? 'true' : undefined}
    >
      <span className={indicatorClass} data-timeline-indicator="">
        <span aria-hidden="true" className={dotClass} data-timeline-dot="">
          {icon}
        </span>
      </span>
      <TimelineConnector />
      <div className={contentClass} data-timeline-content="">
        <TimelineItemContext.Provider value={itemContext}>
          {children}
          {timestamp !== undefined ? <TimelineTimestamp value={timestamp} /> : null}
        </TimelineItemContext.Provider>
      </div>
    </li>
  );
}
TimelineItem.displayName = 'Timeline.Item';

const TIMELINE_ITEM_TYPE: unknown = TimelineItem;

/** True when at least one direct child is a `Timeline.Item`. */
function hasTimelineItemChild(children: ReactNode): boolean {
  let found = false;
  Children.forEach(children, (child) => {
    if (found) return;
    if (isValidElement(child) && child.type === TIMELINE_ITEM_TYPE) found = true;
  });
  return found;
}

/* -------------------------------------------------------------------------- */
/*  Timeline root                                                             */
/* -------------------------------------------------------------------------- */

/**
 * `<Timeline />` — chronological event list.
 *
 * Two APIs share the same DOM: the **prop-driven** form takes a `TimelineItemData[]` and is
 * the right call for audit logs / order tracking where each entry is uniform; the **compound**
 * form (`<Timeline.Item>` children) is the right call for activity feeds where each entry has
 * bespoke markup (avatars, embedded media, inline links).
 *
 * **Visual rhythm.** Each item is a CSS grid with an `[indicator] [content]` template (vertical)
 * or a stacked `[indicator] / [connector] / [content]` template (horizontal). The connector is
 * a real `<span aria-hidden>` inside the indicator column so the Tailwind JIT scanner picks up
 * every utility — no pseudo-elements, no `[attr]:` arbitrary selectors that need a safelist.
 *
 * **Semantics.** The root is an `<ol>` with `aria-label`. Each item is an `<li>` with
 * `aria-current="true"` when `active`. Timestamps render as `<time dateTime={iso}>` for real
 * `Date` inputs, falling back to `<span>` for string passthroughs.
 *
 * **i18n.** No external date library — `Intl.RelativeTimeFormat` + `Intl.DateTimeFormat` handle
 * every locale we ship. Pass `timestampFormat="relative"` (default) for "3 days ago" rhythm
 * common in activity feeds; `"absolute"` for audit logs where exact stamps matter; or a
 * function for fully custom formatting.
 *
 * @example
 *   <Timeline
 *     items={[
 *       { id: '1', title: 'Order placed', timestamp: t1, tone: 'success' },
 *       { id: '2', title: 'Shipped', timestamp: t2, tone: 'info', active: true },
 *     ]}
 *   />
 *
 *   <Timeline orientation="horizontal" responsive>
 *     <Timeline.Item tone="success">
 *       <Timeline.Title>v1.0 launched</Timeline.Title>
 *       <Timeline.Description>Public release.</Timeline.Description>
 *     </Timeline.Item>
 *     …
 *   </Timeline>
 */
function TimelineImpl(
  props: TimelineProps,
  ref: React.ForwardedRef<HTMLOListElement>,
): ReactElement {
  const {
    items,
    orientation = 'vertical',
    layout = 'single',
    responsive = false,
    size = 'md',
    showTimestamps = true,
    timestampFormat = 'relative',
    locale,
    collapsible = false,
    onItemClick,
    'aria-label': ariaLabel = 'Timeline',
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: timelineRecipe,
    componentName: 'Timeline',
    props: { orientation, size, responsive, className, sx, style },
  });

  const contextValue = {
    orientation,
    layout,
    size,
    showTimestamps,
    timestampFormat,
    locale,
    collapsible,
    onItemClick,
  };

  const isCompound = hasTimelineItemChild(children);

  return (
    <ol
      ref={ref}
      className={`${rootClass} [&:last-child>li>[data-timeline-connector]]:hidden [&>li:last-child>[data-timeline-connector]]:hidden`}
      style={rootStyle ?? undefined}
      data-timeline=""
      data-orientation={orientation}
      data-layout={layout}
      data-size={size}
      aria-label={ariaLabel}
      {...rest}
    >
      <TimelineContext.Provider value={contextValue}>
        {isCompound
          ? children
          : (items ?? []).map((itemData) => renderItemFromData(itemData))}
      </TimelineContext.Provider>
    </ol>
  );
}

/**
 * Render one `Timeline.Item` from a `TimelineItemData` record. Kept inline so the prop-driven
 * path is just a `.map()` away from the compound path and they share the same render tree.
 */
function renderItemFromData(item: TimelineItemData): ReactElement {
  return (
    <TimelineItem
      key={item.id}
      id={item.id}
      tone={item.tone ?? 'neutral'}
      active={item.active ?? false}
      {...(item.icon !== undefined ? { icon: item.icon } : {})}
      {...(item.timestamp !== undefined ? { timestamp: item.timestamp } : {})}
    >
      <TimelineTitle>{item.title}</TimelineTitle>
      {item.description !== undefined ? (
        <TimelineDescription>{item.description}</TimelineDescription>
      ) : null}
      {item.media !== undefined ? <TimelineMedia>{item.media}</TimelineMedia> : null}
    </TimelineItem>
  );
}

const TimelineBase = forwardRef<HTMLOListElement, TimelineProps>(TimelineImpl, 'Timeline');

export const Timeline = Object.assign(TimelineBase, {
  Item: TimelineItem,
  Title: TimelineTitle,
  Description: TimelineDescription,
  Media: TimelineMedia,
  Timestamp: TimelineTimestamp,
  Connector: TimelineConnector,
});