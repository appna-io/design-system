'use client';

import { ToggleGroup } from '../../Toggle';
import type { SchedulerDensity } from '../Scheduler.types';
import { useSchedulerContext } from '../SchedulerContext';

const ORDER: SchedulerDensity[] = ['compact', 'standard', 'comfortable'];

export interface SchedulerDensitySelectProps {
  /** Limit which density options to surface. @default all three */
  options?: readonly SchedulerDensity[];
  /** Inline aria label override. @default `t.density` */
  'aria-label'?: string;
}

/**
 * Three-way density toggle (`compact` / `standard` / `comfortable`). Uses `<ToggleGroup>` so
 * all three values are visible at once — quicker for hot-swapping than a `<Select>` popover.
 */
export function SchedulerDensitySelect(props: SchedulerDensitySelectProps) {
  const { options = ORDER, 'aria-label': ariaLabel } = props;
  const ctx = useSchedulerContext();
  const { t } = ctx;

  const labels: Record<SchedulerDensity, string> = {
    compact: t.densityCompact,
    standard: t.densityStandard,
    comfortable: t.densityComfortable,
  };

  return (
    <ToggleGroup
      type="single"
      size="sm"
      attached
      value={ctx.state.density}
      onValueChange={(v) => v && ctx.setDensity(v as SchedulerDensity)}
      aria-label={ariaLabel ?? t.density}
    >
      {options.map((d) => (
        <ToggleGroup.Item key={d} value={d} aria-label={labels[d]}>
          {labels[d]}
        </ToggleGroup.Item>
      ))}
    </ToggleGroup>
  );
}

SchedulerDensitySelect.displayName = 'Scheduler.DensitySelect';