import { Avatar, type AvatarRing } from '@apx-ui/ds';

const RINGS: readonly Exclude<AvatarRing, 'none'>[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function WithRing() {
  return (
    <div className="flex flex-wrap items-center gap-5">
      {RINGS.map((ring) => (
        <div key={ring} className="flex flex-col items-center gap-2">
          <Avatar name="Ada Lovelace" ring={ring} />
          <span className="text-xs text-fg-muted">{ring}</span>
        </div>
      ))}
    </div>
  );
}
