import { Div, Skeleton, SkeletonAvatar, SkeletonText } from '@apx-ui/ds';

export default function Overview() {
  return (
    <Div display="flex" flexDirection="column" gap="6" className="max-w-md">
      <Div display="flex" alignItems="start" gap="3">
        <SkeletonAvatar size="md" />
        <Div display="flex" flexDirection="column" gap="2" className="flex-1">
          <Skeleton width="40%" height={14} />
          <SkeletonText lines={2} height={10} lastLineWidth="70%" />
        </Div>
      </Div>

      <Div
        display="flex"
        flexDirection="column"
        gap="4"
        className="rounded-lg border border-border bg-bg-paper p-5"
      >
        <Skeleton width="100%" height={120} rounded="md" />
        <Skeleton width="70%" height={20} />
        <SkeletonText lines={2} height={12} />
      </Div>

      <Div display="flex" alignItems="start" gap="3">
        <SkeletonAvatar size="sm" />
        <Div display="flex" flexDirection="column" gap="2" className="flex-1">
          <Skeleton width="55%" height={14} />
          <Skeleton width="35%" height={10} />
        </Div>
      </Div>
    </Div>
  );
}