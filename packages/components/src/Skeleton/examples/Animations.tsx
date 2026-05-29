import { Skeleton } from '@apx-ui/ds';

export default function Animations() {
  return (
    <div className="flex flex-col gap-4" style={{ maxWidth: 360 }}>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-fg-muted">shimmer (default)</span>
        <Skeleton animation="shimmer" width="100%" height={24} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-fg-muted">pulse</span>
        <Skeleton animation="pulse" width="100%" height={24} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-fg-muted">none</span>
        <Skeleton animation="none" width="100%" height={24} />
      </div>
    </div>
  );
}
