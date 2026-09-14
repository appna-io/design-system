import { Div, Stat, StatGroup, Typography } from '@apx-ui/ds';

/**
 * The "by the numbers" band. Scroll this into view and each figure rolls up from zero once.
 *
 * Two details do the work:
 *
 * - Every intermediate frame goes through the same formatter as the final value, so the currency
 *   stat counts *in currency* rather than counting in raw digits and snapping to `$` at the end.
 * - The value slot is `tabular-nums`, so the digits keep a constant width and the tile doesn't
 *   jitter on every frame.
 *
 * It fires once. A stat that re-counts each time you scroll back past it is a distraction.
 */
export default function CountUp() {
  return (
    <Div className="space-y-4">
      <Typography variant="bodySmall" color="foreground.subtle">
        Scroll away and back — it counts once, then stays put.
      </Typography>

      <StatGroup>
        <Stat label="Annual revenue" value={12400} format="currency" currency="USD" countUp />
        <Stat label="Orders shipped" value={48219} countUp />
        <Stat label="On-time rate" value={0.987} format="percent" countUp />
      </StatGroup>
    </Div>
  );
}
