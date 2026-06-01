import { Stat, StatGroup } from '@apx-ui/ds';

export default function Overview() {
  return (
    <StatGroup direction="row" divider gap={8}>
      <Stat
        label="Revenue"
        value={124800}
        format="currency"
        delta={{ value: 12.3, direction: 'up' }}
        caption="vs last month"
      />
      <Stat
        label="Active users"
        value={9842}
        format="compact"
        delta={{ value: 8.2, direction: 'up' }}
        caption="DAU rolling 7d"
      />
      <Stat
        label="Conversion rate"
        value={0.214}
        format="percent"
        fractionDigits={1}
        delta={{ value: 1.4, direction: 'up' }}
        caption="vs last week"
      />
    </StatGroup>
  );
}