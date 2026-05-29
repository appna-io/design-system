import { Skeleton, SkeletonAvatar, SkeletonText } from 'apx-ds';

export default function Page() {
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 560 }}>
      <div className="flex items-center gap-3">
        <SkeletonAvatar size="lg" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton width="40%" height={16} />
          <Skeleton width="25%" height={12} />
        </div>
        <Skeleton width={88} height={32} rounded="md" />
      </div>
      <Skeleton width="100%" height={220} rounded="md" />
      <div className="flex flex-col gap-3">
        <Skeleton width="55%" height={24} />
        <SkeletonText lines={4} height={12} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton height={64} rounded="md" />
        <Skeleton height={64} rounded="md" />
        <Skeleton height={64} rounded="md" />
      </div>
    </div>
  );
}
