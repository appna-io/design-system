import { CircularProgress, Progress, type ProgressSize } from '@apx-ui/ds';

const SIZES: readonly ProgressSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  return (
    <div className="flex w-full max-w-md flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">Linear</span>
        {SIZES.map((size) => (
          <Progress key={size} size={size} value={50} aria-label={`Linear ${size}`} />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">Circular</span>
        <div className="flex items-center gap-6">
          {SIZES.map((size) => (
            <CircularProgress
              key={size}
              size={size}
              value={50}
              aria-label={`Circular ${size}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
