import { Div, Stack, Typography } from '@apx-ui/ds';

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
        <Typography
          as="span"
          variant="bodySmall"
          className="rounded-md bg-primary px-3 py-1.5 text-primary-contrast"
        >
          Open
        </Typography>
        <Typography as="span" color="fg.default">
          View documentation &rarr;
        </Typography>
      </a>
    </Stack>
  );
}