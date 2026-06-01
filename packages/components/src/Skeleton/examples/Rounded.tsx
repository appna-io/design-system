import { Div, Skeleton } from '@apx-ui/ds';

export default function Rounded() {
  return (
    <Div display="flex" flexWrap="wrap" alignItems="center" gap="3">
      <Skeleton width={80} height={48} rounded="none" />
      <Skeleton width={80} height={48} rounded="sm" />
      <Skeleton width={80} height={48} rounded="md" />
      <Skeleton width={80} height={48} rounded="lg" />
      <Skeleton width={48} height={48} rounded="full" />
    </Div>
  );
}