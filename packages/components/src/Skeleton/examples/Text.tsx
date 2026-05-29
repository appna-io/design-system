import { SkeletonText } from 'apx-ds';

export default function Text() {
  return (
    <div className="flex flex-col gap-6" style={{ maxWidth: 480 }}>
      <SkeletonText lines={3} />
      <SkeletonText lines={5} spacing="lg" lastLineWidth="40%" height={16} />
    </div>
  );
}
