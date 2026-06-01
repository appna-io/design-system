import { Div, Stat, StatGroup, Typography } from '@apx-ui/ds';

export default function GroupResponsive() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Typography variant="bodySmall" color="fg.muted">
        Resize the viewport — the group collapses to a column on mobile and expands to a row at{' '}
        <code>md</code> and up.
      </Typography>
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
    </Div>
  );
}