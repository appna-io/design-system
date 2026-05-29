import { CircularProgress, Progress } from 'apx-ds';

export default function Indeterminate() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Progress indeterminate aria-label="Loading…" />
      <div className="flex items-center gap-6">
        <CircularProgress indeterminate aria-label="Loading…" />
        <CircularProgress indeterminate variant="soft" color="info" aria-label="Loading…" />
        <CircularProgress
          indeterminate
          color="success"
          size="lg"
          aria-label="Loading…"
        />
      </div>
    </div>
  );
}
