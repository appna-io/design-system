import { Stat } from '@apx-ui/ds';

export default function Compact() {
  return (
    <div className="flex flex-col gap-6">
      <Stat label="Signups" value={12400} format="compact" caption="12.4K — short form" />
      <Stat label="Pageviews" value={1240000} format="compact" delta={{ value: 8.2, direction: 'up' }} />
      <Stat label="Revenue (compact)" value={84512} format="compact" caption="≈ $84.5K" />
    </div>
  );
}
