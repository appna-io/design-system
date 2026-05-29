import { CircularProgress } from 'apx-ds';

export default function ThicknessCircular() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <CircularProgress value={66} size="lg" thickness={2} aria-label="2px" />
      <CircularProgress value={66} size="lg" thickness={4} aria-label="4px (default lg)" />
      <CircularProgress value={66} size="lg" thickness={8} aria-label="8px" />
      <CircularProgress value={66} size="lg" thickness={12} aria-label="12px" />
    </div>
  );
}
