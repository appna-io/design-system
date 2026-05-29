import { Skeleton } from 'apx-ds';

export default function Sizes() {
  return (
    <div className="flex flex-col gap-3" style={{ maxWidth: 360 }}>
      <Skeleton width={120} height={12} />
      <Skeleton width={180} height={16} />
      <Skeleton width={240} height={20} />
      <Skeleton width={300} height={28} />
      <Skeleton width="100%" height={48} />
      <Skeleton width="100%" height={120} rounded="lg" />
    </div>
  );
}
