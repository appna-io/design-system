import { CircularProgress } from 'apx-ds';

export default function CustomSize() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <CircularProgress value={72} size={48} aria-label="48px" />
      <CircularProgress value={72} size={72} aria-label="72px" />
      <CircularProgress value={72} size={96} showLabel aria-label="96px" />
      <CircularProgress value={72} size={120} showLabel aria-label="120px" />
    </div>
  );
}
