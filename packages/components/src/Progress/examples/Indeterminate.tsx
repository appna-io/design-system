import { CircularProgress, Div, Progress } from '@apx-ui/ds';

export default function Indeterminate() {
  return (
    <Div display="flex" flexDirection="column" gap="6" className="w-full max-w-sm">
      <Progress indeterminate aria-label="Loading…" />
      <Div display="flex" alignItems="center" gap="6">
        <CircularProgress indeterminate aria-label="Loading…" />
        <CircularProgress indeterminate variant="soft" color="info" aria-label="Loading…" />
        <CircularProgress
          indeterminate
          color="success"
          size="lg"
          aria-label="Loading…"
        />
      </Div>
    </Div>
  );
}