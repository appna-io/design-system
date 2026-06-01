import { Div, Skeleton, SkeletonAvatar, SkeletonText, Typography } from '@apx-ui/ds';

export default function ListItem() {
  return (
    <Div
      as="ul"
      display="flex"
      flexDirection="column"
      gap="4"
      className="max-w-[480px] list-none p-0"
    >
      {[0, 1, 2].map((i) => (
        <Typography as="li" key={i} className="flex items-start gap-3">
          <SkeletonAvatar size="md" />
          <Div display="flex" flexDirection="column" gap="2" className="flex-1">
            <Skeleton width="40%" height={14} />
            <SkeletonText lines={2} height={10} lastLineWidth="70%" />
          </Div>
        </Typography>
      ))}
    </Div>
  );
}