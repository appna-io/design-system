import { Skeleton } from 'apx-ds';

export default function Rounded() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Skeleton width={80} height={48} rounded="none" />
      <Skeleton width={80} height={48} rounded="sm" />
      <Skeleton width={80} height={48} rounded="md" />
      <Skeleton width={80} height={48} rounded="lg" />
      <Skeleton width={48} height={48} rounded="full" />
    </div>
  );
}
