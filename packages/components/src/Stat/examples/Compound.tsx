import { Stat } from 'apx-ds';
import { TrendingUp } from 'lucide-react';

export default function Compound() {
  return (
    <div className="flex flex-col gap-6">
      <p className="text-fg-muted text-sm">
        Compound mode lets you take full control of the layout. When any
        <code className="bg-bg-subtle mx-1 rounded px-1.5 py-0.5 text-xs">Stat.*</code>
        subcomponent is passed as a child, the shortcut props (<code>label</code>, <code>value</code>, …) are ignored.
      </p>

      <Stat>
        <Stat.Icon>
          <TrendingUp />
        </Stat.Icon>
        <Stat.Label>Monthly recurring revenue</Stat.Label>
        <Stat.Value>$84,512</Stat.Value>
        <Stat.Delta value={5.4} direction="up" />
        <Stat.Caption>+$4,341 over last month</Stat.Caption>
      </Stat>

      <Stat variant="elevated" size="lg">
        <Stat.Label>Hero KPI</Stat.Label>
        <Stat.Value>1.24M</Stat.Value>
        <Stat.Delta value={12} direction="up" suffix="%" />
        <Stat.Caption>Active sessions this week</Stat.Caption>
      </Stat>
    </div>
  );
}
