import { Div, Stat } from '@apx-ui/ds';

export default function Percent() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Stat label="Conversion rate" value={0.214} format="percent" fractionDigits={1} />
      <Stat label="Open rate" value={0.487} format="percent" delta={{ value: 3.2, direction: 'up' }} />
      <Stat label="Bounce rate" value={0.124} format="percent" delta={{ value: 1.4, direction: 'down', inverse: true }} caption="Lower is better" />
    </Div>
  );
}