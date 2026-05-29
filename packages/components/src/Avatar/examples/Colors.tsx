import { Avatar, type AvatarColor } from '@apx-ui/ds';

const EXPLICIT_COLORS: readonly Exclude<AvatarColor, 'auto'>[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

const AUTO_NAMES = ['Ada', 'Bren', 'Cleo', 'Dax', 'Eli', 'Fae', 'Gigi', 'Hugo'];

export default function Colors() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          Explicit color
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {EXPLICIT_COLORS.map((color) => (
            <Avatar key={color} color={color} name={color.charAt(0).toUpperCase()} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
          color=&ldquo;auto&rdquo; (deterministic from name)
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {AUTO_NAMES.map((name) => (
            <Avatar key={name} name={name} />
          ))}
        </div>
      </div>
    </div>
  );
}
