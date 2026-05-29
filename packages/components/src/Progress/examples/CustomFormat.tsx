import { CircularProgress, Progress } from '@apx-ui/ds';

const GIB = 1024 * 1024 * 1024;

export default function CustomFormat() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Progress
        value={2.4 * GIB}
        max={4 * GIB}
        size="lg"
        showLabel
        labelFormat={(value, max) =>
          `${(value / GIB).toFixed(1)} GB / ${(max / GIB).toFixed(0)} GB`
        }
        aria-label="Download progress"
      />
      <CircularProgress
        value={3}
        max={5}
        size={80}
        showLabel
        labelFormat={(value, max) => `${value}/${max}`}
        aria-label="Step 3 of 5"
      />
    </div>
  );
}
