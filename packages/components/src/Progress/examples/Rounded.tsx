import { Progress, type ProgressRounded } from 'apx-ds';

const ROUNDED: readonly ProgressRounded[] = ['sm', 'md', 'lg', 'full'];

export default function Rounded() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      {ROUNDED.map((rounded) => (
        <div key={rounded} className="flex flex-col gap-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-fg-muted">
            rounded={rounded}
          </span>
          <Progress
            rounded={rounded}
            value={62}
            size="lg"
            aria-label={`Rounded ${rounded}`}
          />
        </div>
      ))}
    </div>
  );
}
