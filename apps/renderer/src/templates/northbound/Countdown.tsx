'use client';

import { useEffect, useState } from 'react';
import { Div, Typography } from '@apx-ui/ds';

import { brand } from './content';

/**
 * The live countdown to the first session.
 *
 * This is the template's motion thesis in one component. Every other template's motion is
 * *decorative* — it plays once on reveal and then the page is static. A conference's whole
 * proposition is that something happens at a specific time, so the one thing on this page that
 * keeps moving is the clock. It is also the only honest use of continuous motion I could argue
 * for: the number changes because the fact changed.
 *
 * ## Why the digits are rendered as fixed-width columns
 *
 * A ticking number that reflows the layout every second is worse than no countdown. The digits
 * use `tabular-nums` and each unit is a fixed-width block, so 09 → 10 → 11 never moves the
 * separator. Per #2's rule that metric numerals use the display face at `tabular-nums`.
 *
 * ## Reduced motion
 *
 * There is nothing to disable. The value updates once a second — that is data, not animation, and
 * `prefers-reduced-motion` is not a request to stop being told the time. What it *would* rightly
 * suppress is a flip/roll transition between digits, which is exactly why there isn't one: the
 * digit is replaced, not animated. That keeps this component correct for reduced-motion users
 * without a branch.
 *
 * ## SSR
 *
 * `remaining` starts `null` and is filled on mount. Computing it during render would produce a
 * server value that is already stale by the time it hydrates — React would warn, and the first
 * paint would show a wrong time. A dashed placeholder of the same width is the honest first
 * frame, and it does not shift when the real value lands.
 */
interface Remaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const UNITS: readonly { key: keyof Remaining; label: string }[] = [
  { key: 'days', label: 'days' },
  { key: 'hours', label: 'hrs' },
  { key: 'minutes', label: 'min' },
  { key: 'seconds', label: 'sec' },
];

function remainingUntil(target: number, now: number): Remaining {
  const ms = Math.max(0, target - now);
  const total = Math.floor(ms / 1000);
  return {
    days: Math.floor(total / 86_400),
    hours: Math.floor((total % 86_400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

export function Countdown() {
  const [remaining, setRemaining] = useState<Remaining | null>(null);

  useEffect(() => {
    const target = new Date(brand.startsAt).getTime();
    const tick = () => setRemaining(remainingUntil(target, Date.now()));

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <Div
      className="flex flex-wrap items-start gap-x-6 gap-y-4"
      // One live region for the whole clock rather than four. `polite` so it never interrupts,
      // and the label is the sentence a screen-reader user actually wants — not "07" four times.
      role="timer"
      aria-live="off"
      aria-label={
        remaining
          ? `${remaining.days} days, ${remaining.hours} hours and ${remaining.minutes} minutes until Northbound begins`
          : 'Counting down to Northbound'
      }
    >
      {UNITS.map(({ key, label }) => (
        <Div key={key} className="min-w-[3.5rem]">
          <Typography
            as="span"
            variant="h2"
            weight="bold"
            fontFamily="display"
            lineHeight="none"
            letterSpacing="tight"
            className="block text-4xl tabular-nums sm:text-5xl"
            aria-hidden
          >
            {remaining ? String(remaining[key]).padStart(2, '0') : '––'}
          </Typography>
          <Typography
            as="span"
            variant="overline"
            weight="semibold"
            transform="upper"
            letterSpacing="wider"
            color="fg.muted"
            className="mt-2 block"
            aria-hidden
          >
            {label}
          </Typography>
        </Div>
      ))}
    </Div>
  );
}
