import { Stack } from 'apx-ds';

export default function Basic() {
  return (
    <Stack gap={3} className="max-w-sm">
      <div className="rounded-lg border border-border bg-bg-paper p-3">One</div>
      <div className="rounded-lg border border-border bg-bg-paper p-3">Two</div>
      <div className="rounded-lg border border-border bg-bg-paper p-3">Three</div>
    </Stack>
  );
}
