import { Div, Stat, Typography } from '@apx-ui/ds';

export default function DeltaInverse() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Typography variant="bodySmall" color="fg.muted">
        Some metrics are <em>good when they go down</em> (churn, error rate, latency). Pass
        <code className="bg-bg-subtle mx-1 rounded px-1.5 py-0.5 text-xs">inverse: true</code>
        on the delta so the color logic flips — down becomes green, up becomes red.
      </Typography>

      <Stat
        label="Customer churn"
        value={0.042}
        format="percent"
        fractionDigits={1}
        delta={{ value: 1.1, direction: 'down', inverse: true }}
        caption="MoM — lower is better"
      />

      <Stat
        label="Error rate"
        value={0.0021}
        format="percent"
        fractionDigits={2}
        delta={{ value: 0.5, direction: 'up', inverse: true }}
        caption="Up is bad — investigate"
      />
    </Div>
  );
}