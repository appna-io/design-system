import type {
  CSSProperties,
  ForwardedRef,
  ReactNode,
} from 'react';
import type { Sx } from '@apx-ui/engine';

/** Axis: vertical (default) or horizontal. */
export type TimelineOrientation = 'vertical' | 'horizontal';

/** Layout pattern. `alternating` zig-zags content sides — vertical orientation only. */
export type TimelineLayout = 'single' | 'alternating';

/** Item indicator size — drives dot diameter, icon size, gap rhythm. */
export type TimelineSize = 'sm' | 'md' | 'lg';

/** Semantic tone for an item's indicator. Maps to palette role tokens. */
export type TimelineTone = 'info' | 'success' | 'warning' | 'danger' | 'neutral';

/** Timestamp render strategy. */
export type TimelineTimestampFormat =
  | 'relative'
  | 'absolute'
  | ((value: Date) => string);

/** A single event in prop-driven mode. Mirrors the compound `<Timeline.Item />` props. */
export interface TimelineItemData {
  id: string;
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  timestamp?: Date | string | null;
  tone?: TimelineTone;
  /** Visual emphasis for the "current" event. Adds a ring + pulse (motion-reduce safe). */
  active?: boolean | undefined;
  /** Slotted media (image / embed) rendered below the description. */
  media?: ReactNode;
}

export interface TimelineProps {
  /** Prop-driven event list. Ignored when compound `Timeline.Item` children are present. */
  items?: TimelineItemData[];
  /** @default 'vertical' */
  orientation?: TimelineOrientation;
  /** Zig-zag content position. Only meaningful for vertical orientation. @default 'single' */
  layout?: TimelineLayout;
  /** When `true` and `orientation='horizontal'`, collapses to vertical on `< md` screens. */
  responsive?: boolean;
  /** @default 'md' */
  size?: TimelineSize;
  /** Whether to render the timestamp column / row. @default true */
  showTimestamps?: boolean;
  /** Strategy for formatting `Date` timestamps. @default 'relative' */
  timestampFormat?: TimelineTimestampFormat;
  /** Override locale used by `Intl.RelativeTimeFormat` / `Intl.DateTimeFormat`. */
  locale?: string;
  /** When `true`, items become expand/collapse buttons (title → button). @default false */
  collapsible?: boolean;
  /** Fired on item title click (collapse toggle if `collapsible`, navigation otherwise). */
  onItemClick?: (id: string) => void;
  /** Accessible label for the timeline list. @default 'Timeline' */
  'aria-label'?: string;
  className?: string;
  style?: CSSProperties;
  sx?: Sx;
  children?: ReactNode;
  ref?: ForwardedRef<HTMLOListElement>;
}

/** Props for `<Timeline.Item />`. */
export interface TimelineItemProps {
  /** Stable identifier — required for collapsible items and `onItemClick` callbacks. */
  id?: string;
  icon?: ReactNode;
  /** Semantic tone. @default 'neutral' */
  tone?: TimelineTone;
  /** Render with the active ring + pulse emphasis. Adds `aria-current="true"`. */
  active?: boolean | undefined;
  /** Slotted timestamp. Pass `null` or omit to hide the timestamp slot. */
  timestamp?: Date | string | null;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  sx?: Sx;
}

export interface TimelineSubcomponentProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  sx?: Sx;
}

/** Context shared from `<Timeline>` to its items + subparts. */
export interface TimelineContextValue {
  orientation: TimelineOrientation;
  layout: TimelineLayout;
  size: TimelineSize;
  showTimestamps: boolean;
  timestampFormat: TimelineTimestampFormat;
  locale: string | undefined;
  collapsible: boolean;
  onItemClick: ((id: string) => void) | undefined;
}

/** Context shared from `<Timeline.Item>` to its subcomponents. */
export interface TimelineItemContextValue {
  id: string;
  tone: TimelineTone;
  active: boolean;
  /** Toggle the description collapse — only set when the parent Timeline has `collapsible`. */
  toggleExpanded: (() => void) | undefined;
  /** Current expansion state — only meaningful when `collapsible`. */
  expanded: boolean;
  /** DOM id for the title/button — used by `aria-controls` on the description region. */
  titleId: string;
  /** DOM id for the description region — used by `aria-controls` on the title button. */
  descriptionId: string;
}