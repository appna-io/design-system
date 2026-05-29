import { Avatar, type AvatarSize } from 'apx-ds';

const SIZES: readonly AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

export default function Sizes() {
  return (
    <div className="flex flex-wrap items-end gap-4">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <Avatar size={size} name="Ada Lovelace" />
          <span className="text-xs text-fg-muted">{size}</span>
        </div>
      ))}
    </div>
  );
}
