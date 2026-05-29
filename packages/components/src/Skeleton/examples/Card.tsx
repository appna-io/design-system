import { Skeleton, SkeletonText } from '@apx-ui/ds';

export default function Card() {
  return (
    <div
      className="flex flex-col gap-4 rounded-lg border border-border bg-bg-paper p-5"
      style={{ maxWidth: 360 }}
    >
      <Skeleton width="100%" height={160} rounded="md" />
      <div className="flex flex-col gap-3">
        <Skeleton width="70%" height={20} />
        <SkeletonText lines={3} height={12} />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton width={80} height={32} rounded="md" />
        <Skeleton width={80} height={32} rounded="md" />
      </div>
    </div>
  );
}
