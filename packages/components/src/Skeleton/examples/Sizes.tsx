import { Div, Skeleton } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="3" className="max-w-[360px]">
      <Skeleton width={120} height={12} />
      <Skeleton width={180} height={16} />
      <Skeleton width={240} height={20} />
      <Skeleton width={300} height={28} />
      <Skeleton width="100%" height={48} />
      <Skeleton width="100%" height={120} rounded="lg" />
    </Div>
  );
}