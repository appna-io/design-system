import { Div, Skeleton, SkeletonText } from '@apx-ui/ds';

export default function Card() {
  return (
    <Div
      display="flex"
      flexDirection="column"
      gap="4"
      className="max-w-[360px] rounded-lg border border-border bg-bg-paper p-5"
    >
      <Skeleton width="100%" height={160} rounded="md" />
      <Div display="flex" flexDirection="column" gap="3">
        <Skeleton width="70%" height={20} />
        <SkeletonText lines={3} height={12} />
      </Div>
      <Div display="flex" alignItems="center" gap="2">
        <Skeleton width={80} height={32} rounded="md" />
        <Skeleton width={80} height={32} rounded="md" />
      </Div>
    </Div>
  );
}