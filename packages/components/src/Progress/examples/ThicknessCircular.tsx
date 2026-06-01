import { CircularProgress, Div } from '@apx-ui/ds';

export default function ThicknessCircular() {
  return (
    <Div display="flex" alignItems="center" className="flex-wrap gap-6">
      <CircularProgress value={66} size="lg" thickness={2} aria-label="2px" />
      <CircularProgress value={66} size="lg" thickness={4} aria-label="4px (default lg)" />
      <CircularProgress value={66} size="lg" thickness={8} aria-label="8px" />
      <CircularProgress value={66} size="lg" thickness={12} aria-label="12px" />
    </Div>
  );
}