import { Stat } from 'apx-ds';

export default function WithDelta() {
  return (
    <div className="flex flex-col gap-6">
      <Stat
        label="Active users"
        value={1240}
        delta={{ value: 12.3, direction: 'up' }}
        caption="vs last week"
      />
      <Stat
        label="Page load time"
        value="2.4s"
        delta={{ value: 0.3, direction: 'down', suffix: 's' }}
        caption="vs last release"
      />
      <Stat
        label="Open tickets"
        value={42}
        delta={{ value: 0, direction: 'neutral' }}
        caption="No change today"
      />
    </div>
  );
}
