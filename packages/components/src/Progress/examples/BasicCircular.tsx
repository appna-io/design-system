import { CircularProgress } from '@apx-ui/ds';

export default function BasicCircular() {
  return (
    <div className="flex items-center gap-6">
      <CircularProgress value={66} aria-label="Upload progress" />
      <CircularProgress value={66} showLabel aria-label="Upload progress with label" />
    </div>
  );
}
