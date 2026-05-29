import { Stat, StatGroup } from 'apx-ds';

export default function Group() {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <h3 className="text-fg-muted mb-3 text-sm font-medium">Row with auto-inserted dividers</h3>
        <StatGroup divider gap={8}>
          <Stat label="Revenue" value={12400} format="currency" />
          <Stat label="Orders" value={47} />
          <Stat label="Conversion" value={0.214} format="percent" fractionDigits={1} />
        </StatGroup>
      </section>

      <section>
        <h3 className="text-fg-muted mb-3 text-sm font-medium">Column layout</h3>
        <StatGroup direction="column" divider gap={4}>
          <Stat label="Signups today" value={120} delta={{ value: 5, direction: 'up' }} />
          <Stat label="Signups this week" value={840} delta={{ value: 12, direction: 'up' }} />
          <Stat label="Signups this month" value={3520} delta={{ value: 8, direction: 'up' }} />
        </StatGroup>
      </section>
    </div>
  );
}
