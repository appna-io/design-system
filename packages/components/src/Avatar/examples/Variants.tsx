import { Avatar, type AvatarVariant } from '@apx-ui/ds';

const VARIANTS: readonly AvatarVariant[] = ['solid', 'outline', 'soft'];

export default function Variants() {
  return (
    <div className="flex items-center gap-6">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <Avatar variant={variant} name="Ada Lovelace" color="primary" />
          <span className="text-xs text-fg-muted">{variant}</span>
        </div>
      ))}
    </div>
  );
}
