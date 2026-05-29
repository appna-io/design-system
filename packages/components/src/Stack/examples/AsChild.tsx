import { Stack } from '@apx-ui/ds';

export default function AsChild() {
  return (
    <Stack
      asChild
      direction="row"
      gap={3}
      align="center"
      className="rounded-lg border border-border bg-bg-paper p-3 hover:border-primary"
    >
      <a href="https://example.com" rel="noreferrer">
        <span className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-contrast">
          Open
        </span>
        <span className="text-fg-default">View documentation &rarr;</span>
      </a>
    </Stack>
  );
}
