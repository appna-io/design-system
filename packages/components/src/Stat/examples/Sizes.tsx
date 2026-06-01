import { Div, Stat } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="8">
      <Stat
        size="sm"
        label="Small — compact widgets"
        value={1240}
        delta={{ value: 5, direction: 'up' }}
      />
      <Stat
        size="md"
        label="Medium — default"
        value={1240}
        delta={{ value: 5, direction: 'up' }}
      />
      <Stat
        size="lg"
        label="Large — hero KPI tile"
        value={1240}
        delta={{ value: 5, direction: 'up' }}
      />
    </Div>
  );
}