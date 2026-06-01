'use client';

import type { ReactNode } from 'react';

import { useSlotClass } from '../helpers/useSlotClass';
import {
  schedulerSidebarRecipe,
  schedulerSidebarSectionRecipe,
} from '../Scheduler.recipe';
import { SchedulerCalendarList } from './SchedulerCalendarList';
import { SchedulerHolidayToggle } from './SchedulerHolidayToggle';
import { SchedulerMiniMonth } from './SchedulerMiniMonth';

export interface SchedulerSidebarProps {
  /** Replace the default layout (mini-month + calendars + holiday toggle) entirely. */
  children?: ReactNode;
  /** Hide the mini-month section. @default false */
  hideMiniMonth?: boolean;
  /** Hide the calendars section. @default false */
  hideCalendars?: boolean;
  /** Hide the holiday-toggle section. @default false */
  hideHolidayToggle?: boolean;
}

/**
 * Leading-edge sidebar. Renders mini-month + calendar checkboxes + holiday toggle by
 * default; consumers can pass `children` to fully replace the layout, or use one of the
 * `hide…` props to drop a single section without rebuilding the rest.
 */
export function SchedulerSidebar(props: SchedulerSidebarProps) {
  const rootClasses = useSlotClass('scheduler.sidebar', schedulerSidebarRecipe, {});
  const sectionClasses = useSlotClass(
    'scheduler.sidebar.section',
    schedulerSidebarSectionRecipe,
    {},
  );

  if (props.children !== undefined) {
    return <aside className={rootClasses}>{props.children}</aside>;
  }

  return (
    <aside className={rootClasses}>
      {!props.hideMiniMonth && (
        <div className={sectionClasses}>
          <SchedulerMiniMonth />
        </div>
      )}
      {!props.hideCalendars && (
        <div className={sectionClasses}>
          <SchedulerCalendarList />
        </div>
      )}
      {!props.hideHolidayToggle && (
        <div className={sectionClasses}>
          <SchedulerHolidayToggle />
        </div>
      )}
    </aside>
  );
}

SchedulerSidebar.displayName = 'Scheduler.Sidebar';