import { useState } from 'react';

import { Calendar } from '@apx-ui/ds';

/**
 * Custom day-cell renderer — draw a tiny dot under days that have an associated event count.
 * The headless layer still owns selection + keyboard nav; the slot only swaps the visual.
 */
export default function CustomDayRender() {
  const [d, setD] = useState<Date>(new Date());

  const eventCountByIso: Record<string, number> = {
    [iso(addDays(new Date(), 1))]: 2,
    [iso(addDays(new Date(), 3))]: 1,
    [iso(addDays(new Date(), 8))]: 4,
  };

  return (
    <Calendar
      mode="single"
      value={d}
      onChange={(v) => setD(v as Date)}
      variant="outline"
      renderDay={(ctx) => (
        <div className="relative flex h-8 w-8 items-center justify-center rounded-md text-sm">
          <span
            className={[
              'flex h-8 w-8 items-center justify-center rounded-md tabular-nums',
              ctx.isSelected ? 'bg-primary text-fg-onPrimary' : 'hover:bg-bg-subtle',
              ctx.isOutside ? 'text-fg-muted/40' : '',
            ].join(' ')}
          >
            {ctx.label}
          </span>
          {eventCountByIso[iso(ctx.date)] ? (
            <span
              className="absolute bottom-0.5 h-1 w-1 rounded-full bg-info"
              aria-label={`${eventCountByIso[iso(ctx.date)]} events`}
            />
          ) : null}
        </div>
      )}
    />
  );
}

function iso(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}
function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(d.getDate() + n);
  return out;
}
