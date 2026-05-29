import { CircularProgress, Progress, type ProgressColor } from '@apx-ui/ds';

const COLORS: readonly ProgressColor[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

export default function Colors() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">Linear</span>
        {COLORS.map((color) => (
          <div key={color} className="flex items-center gap-3">
            <span className="w-20 text-xs text-fg-muted">{color}</span>
            <Progress
              variant="soft"
              color={color}
              value={62}
              className="flex-1"
              aria-label={`${color} progress`}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">Circular</span>
        <div className="flex flex-wrap items-center gap-4">
          {COLORS.map((color) => (
            <CircularProgress
              key={color}
              color={color}
              value={62}
              showLabel
              aria-label={`${color} circular progress`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
