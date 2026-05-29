import { Stat } from '@apx-ui/ds';

export default function Basic() {
  return (
    <div className="flex flex-col gap-6">
      <Stat label="Revenue" value="$12,400" />
      <Stat label="Active sessions" value={1240} />
      <Stat label="Server uptime" value="99.97%" caption="Last 30 days" />
    </div>
  );
}
