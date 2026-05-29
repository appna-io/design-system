import { createContext, useContext } from 'react';

import type { TimelineContextValue, TimelineItemContextValue } from './Timeline.types';

/** Defaults match `<Timeline>`'s defaults so a stray `Timeline.Item` outside the parent still renders. */
export const TimelineContext = createContext<TimelineContextValue>({
  orientation: 'vertical',
  layout: 'single',
  size: 'md',
  showTimestamps: true,
  timestampFormat: 'relative',
  locale: undefined,
  collapsible: false,
  onItemClick: undefined,
});

export const useTimelineContext = (): TimelineContextValue => useContext(TimelineContext);

/** Item-level context exposes the toggle handler + ARIA ids for the title/button + description. */
export const TimelineItemContext = createContext<TimelineItemContextValue | null>(null);

export const useTimelineItemContext = (): TimelineItemContextValue | null =>
  useContext(TimelineItemContext);
