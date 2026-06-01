import { Div, SkeletonText } from '@apx-ui/ds';

export default function Text() {
  return (
    <Div display="flex" flexDirection="column" gap="6" className="max-w-[480px]">
      <SkeletonText lines={3} />
      <SkeletonText lines={5} spacing="lg" lastLineWidth="40%" height={16} />
    </Div>
  );
}