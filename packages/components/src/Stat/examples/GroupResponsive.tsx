import { Stat, StatGroup } from '@apx-ui/ds';

export default function GroupResponsive() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-fg-muted text-sm">
        Resize the viewport — the group collapses to a column on mobile and expands to a row at <code>md</code> and up.
      </p>
      <StatGroup
        direction={{ base: 'column', md: 'row' }}
        gap={{ base: 4, md: 8 }}
        divider
      >
        <Stat label="MRR" value={84512} format="currency" delta={{ value: 5.4, direction: 'up' }} />
        <Stat label="Active users" value={1240} delta={{ value: 12, direction: 'up' }} />
        <Stat label="Churn" value={0.042} format="percent" fractionDigits={1} delta={{ value: 1.1, direction: 'down', inverse: true }} />
        <Stat label="NPS" value={42} delta={{ value: 3, direction: 'up' }} />
      </StatGroup>
    </div>
  );
}
