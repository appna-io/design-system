'use client';

import { useSlotClass } from '../helpers/useSlotClass';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo } from 'react';

import { Button } from '../../Button/Button';
import { Toggle, ToggleGroup } from '../../Toggle';
import {
  schedulerToolbarRecipe,
  schedulerToolbarTitleRecipe,
} from '../Scheduler.recipe';
import type { SchedulerView } from '../Scheduler.types';
import { useSchedulerContext } from '../SchedulerContext';
import { formatRangeTitle } from '../helpers/formatTime';
import { SchedulerDensitySelect } from './SchedulerDensitySelect';
import { SchedulerFilterMenu } from './SchedulerFilterMenu';
import { SchedulerSearchInput } from './SchedulerSearchInput';

export interface SchedulerToolbarProps {
  /** When `'minimal'`, hide the view switcher (only nav + title + today). */
  variant?: 'full' | 'minimal';
  /** Custom slot on the leading edge — e.g. a hamburger or "Create" button. */
  leading?: React.ReactNode;
  /** Custom slot on the trailing edge — typically the filters / settings menu. */
  trailing?: React.ReactNode;
}

const ALL_VIEWS: SchedulerView[] = [
  'day',
  'week',
  'workWeek',
  'month',
  'multiDay',
  'agenda',
];

/**
 * Default toolbar — prev / next / today + centred title + view-switcher.
 *
 * Compose-don't-reinvent: the view switcher is a `<ToggleGroup type="single">` directly;
 * the prev/next/today buttons are plain `<Button>`s. No new primitives invented.
 */
export function SchedulerToolbar(props: SchedulerToolbarProps) {
  const { variant = 'full', leading, trailing } = props;
  const ctx = useSchedulerContext();
  const { state, t, locale } = ctx;

  const classes = useSlotClass('scheduler.toolbar', schedulerToolbarRecipe, {
    density: state.density,
  });
  const titleClasses = useSlotClass(
    'scheduler.toolbar.title',
    schedulerToolbarTitleRecipe,
    { size: ctx.size },
  );

  const title = useMemo(
    () =>
      formatRangeTitle({
        view: state.view,
        anchor: state.date,
        range: state.visibleRange,
        locale,
      }),
    [state.view, state.date, state.visibleRange, locale],
  );

  return (
    <div className={classes} role="toolbar" aria-label={t.toolbar}>
      {leading}
      <Button
        variant="ghost"
        size="sm"
        onClick={ctx.goToday}
        aria-label={t.today}
      >
        {t.today}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={ctx.goPrev}
        aria-label={t.prev}
      >
        <ChevronLeft size={16} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={ctx.goNext}
        aria-label={t.next}
      >
        <ChevronRight size={16} />
      </Button>
      <h2
        className={titleClasses}
        aria-live="polite"
        style={{ flex: '1 1 auto', minWidth: 0 }}
      >
        {title}
      </h2>
      {variant === 'full' && (
        <ToggleGroup
          type="single"
          size="sm"
          attached
          value={state.view}
          onValueChange={(v) => v && ctx.setView(v as SchedulerView)}
          aria-label="View"
        >
          {ALL_VIEWS.map((v) => (
            <ToggleGroup.Item key={v} value={v} aria-label={t.views[v]}>
              {t.views[v]}
            </ToggleGroup.Item>
          ))}
        </ToggleGroup>
      )}
      {ctx.chrome.search ? <SchedulerSearchInput /> : null}
      {ctx.chrome.density ? <SchedulerDensitySelect /> : null}
      {ctx.chrome.filters ? <SchedulerFilterMenu /> : null}
      {trailing}
    </div>
  );
}

SchedulerToolbar.displayName = 'Scheduler.Toolbar';

// Touch the imports so unused-warnings stay quiet when downstream views drop them.
void Toggle;
