import { Div, Stat, StatGroup, Typography } from '@apx-ui/ds';

export default function Group() {
  return (
    <Div display="flex" flexDirection="column" gap="10">
      <Div as="section">
        <Typography
          as="h3"
          variant="bodySmall"
          weight="medium"
          color="fg.muted"
          className="mb-3"
        >
          Row with auto-inserted dividers
        </Typography>
        <StatGroup divider gap={8}>
          <Stat label="Revenue" value={12400} format="currency" />
          <Stat label="Orders" value={47} />
          <Stat label="Conversion" value={0.214} format="percent" fractionDigits={1} />
        </StatGroup>
      </Div>

      <Div as="section">
        <Typography
          as="h3"
          variant="bodySmall"
          weight="medium"
          color="fg.muted"
          className="mb-3"
        >
          Column layout
        </Typography>
        <StatGroup direction="column" divider gap={4}>
          <Stat label="Signups today" value={120} delta={{ value: 5, direction: 'up' }} />
          <Stat label="Signups this week" value={840} delta={{ value: 12, direction: 'up' }} />
          <Stat label="Signups this month" value={3520} delta={{ value: 8, direction: 'up' }} />
        </StatGroup>
      </Div>
    </Div>
  );
}