import { Div, Skeleton, SkeletonAvatar, SkeletonText } from '@apx-ui/ds';

export default function Page() {
  return (
    <Div display="flex" flexDirection="column" gap="6" className="max-w-[560px]">
      <Div display="flex" alignItems="center" gap="3">
        <SkeletonAvatar size="lg" />
        <Div display="flex" flexDirection="column" gap="2" className="flex-1">
          <Skeleton width="40%" height={16} />
          <Skeleton width="25%" height={12} />
        </Div>
        <Skeleton width={88} height={32} rounded="md" />
      </Div>
      <Skeleton width="100%" height={220} rounded="md" />
      <Div display="flex" flexDirection="column" gap="3">
        <Skeleton width="55%" height={24} />
        <SkeletonText lines={4} height={12} />
      </Div>
      <Div className="grid grid-cols-3 gap-3">
        <Skeleton height={64} rounded="md" />
        <Skeleton height={64} rounded="md" />
        <Skeleton height={64} rounded="md" />
      </Div>
    </Div>
  );
}