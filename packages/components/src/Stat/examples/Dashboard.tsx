import { Div, Stat, StatGroup, Typography } from '@apx-ui/ds';
import { DollarSign, ShoppingCart, TrendingDown, Users } from 'lucide-react';

export default function Dashboard() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Typography as="h3" variant="h5" color="fg.default">
        Q3 dashboard — at a glance
      </Typography>
      <StatGroup
        direction={{ base: 'column', md: 'row' }}
        gap={4}
      >
        <Stat
          variant="elevated"
          icon={<DollarSign />}
          label="Revenue"
          value={84512}
          format="currency"
          delta={{ value: 12.3, direction: 'up' }}
          caption="vs Q2"
          className="flex-1"
        />
        <Stat
          variant="elevated"
          icon={<ShoppingCart />}
          label="Orders"
          value={1240}
          delta={{ value: 4.7, direction: 'up' }}
          caption="vs last week"
          className="flex-1"
        />
        <Stat
          variant="elevated"
          icon={<Users />}
          label="Active users"
          value={9842}
          format="compact"
          delta={{ value: 8.2, direction: 'up' }}
          caption="DAU rolling 7d"
          className="flex-1"
        />
        <Stat
          variant="elevated"
          icon={<TrendingDown />}
          label="Churn"
          value={0.042}
          format="percent"
          fractionDigits={1}
          delta={{ value: 0.4, direction: 'down', inverse: true }}
          caption="MoM — lower is better"
          className="flex-1"
        />
      </StatGroup>
    </Div>
  );
}