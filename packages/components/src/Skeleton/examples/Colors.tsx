import { Skeleton } from '@apx-ui/ds';

const COLORS = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'] as const;

export default function Colors() {
  return (
    <div className="flex flex-col gap-3" style={{ maxWidth: 360 }}>
      {COLORS.map((color) => (
        <div key={color} className="flex items-center gap-3">
          <span className="w-20 text-xs font-medium text-fg-muted">{color}</span>
          <Skeleton variant="soft" color={color} width="100%" height={20} />
        </div>
      ))}
    </div>
  );
}
