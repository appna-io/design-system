import { Div, SkeletonAvatar } from '@apx-ui/ds';

export default function Avatar() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="end" gap="4">
      <SkeletonAvatar size="xs" />
      <SkeletonAvatar size="sm" />
      <SkeletonAvatar size="md" />
      <SkeletonAvatar size="lg" />
      <SkeletonAvatar size="xl" />
      <SkeletonAvatar size="2xl" />
      <SkeletonAvatar size={120} />
    </Div>
  );
}