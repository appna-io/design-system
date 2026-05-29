import { Skeleton, SkeletonAvatar, SkeletonText } from '@apx-ui/ds';

export default function ListItem() {
  return (
    <ul className="flex flex-col gap-4" style={{ maxWidth: 480, listStyle: 'none', padding: 0 }}>
      {[0, 1, 2].map((i) => (
        <li key={i} className="flex items-start gap-3">
          <SkeletonAvatar size="md" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton width="40%" height={14} />
            <SkeletonText lines={2} height={10} lastLineWidth="70%" />
          </div>
        </li>
      ))}
    </ul>
  );
}
