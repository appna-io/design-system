import { Div, Stack } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Stack gap={3} className="max-w-sm">
      <Div className="rounded-lg border border-border bg-bg-paper p-3">One</Div>
      <Div className="rounded-lg border border-border bg-bg-paper p-3">Two</Div>
      <Div className="rounded-lg border border-border bg-bg-paper p-3">Three</Div>
    </Stack>
  );
}