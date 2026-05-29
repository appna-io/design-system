import { Progress, type ProgressVariant } from 'apx-ds';

const VARIANTS: readonly ProgressVariant[] = ['solid', 'soft', 'striped'];

export default function Variants() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {VARIANTS.map((variant) => (
        <div key={variant} className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            {variant}
          </span>
          <Progress variant={variant} value={62} aria-label={`${variant} progress`} />
        </div>
      ))}
    </div>
  );
}
