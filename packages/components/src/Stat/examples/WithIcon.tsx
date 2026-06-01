import { Div, Stat } from '@apx-ui/ds';
import { DollarSign, ShoppingCart, Users } from 'lucide-react';

export default function WithIcon() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Stat
        label="Revenue"
        icon={<DollarSign />}
        value={12400}
        format="currency"
        delta={{ value: 5.4, direction: 'up' }}
      />
      <Stat
        label="Orders today"
        icon={<ShoppingCart />}
        value={47}
        caption="vs 39 yesterday"
      />
      <Stat
        label="Active sessions"
        icon={<Users />}
        value={1240}
        delta={{ value: 12.3, direction: 'up' }}
      />
    </Div>
  );
}