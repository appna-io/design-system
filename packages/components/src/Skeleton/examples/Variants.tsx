import { Skeleton } from 'apx-ds';

export default function Variants() {
  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 360 }}>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-fg-muted">solid (default)</span>
        <Skeleton variant="solid" width="100%" height={24} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-fg-muted">soft (color-tinted)</span>
        <Skeleton variant="soft" color="primary" width="100%" height={24} />
      </div>
    </div>
  );
}
