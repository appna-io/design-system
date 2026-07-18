import { AppShell, Div, HStack, Stack, Typography } from '@apx-ui/ds';

export default function CenteredMain() {
  return (
    <Div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        header={
          <HStack gap={3} className="w-full">
            <strong>Docs site</strong>
            <Typography as="span" variant="bodySmall" color="fg.muted">
              max-width main with centered content
            </Typography>
          </HStack>
        }
        sidebar={
          <Stack gap={1} className="p-3">
            <a href="#getting-started" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Getting started</a>
            <a href="#components" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Components</a>
            <a href="#patterns" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Patterns</a>
          </Stack>
        }
        main={{ maxWidth: '2xl', centered: true, padding: 8 }}
      >
        <Typography as="h1" variant="h5" weight="semibold">
          Body content stays readable
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" sx={{ mt: 3 }}>
          Use `main.maxWidth` to keep prose at a comfortable measure (60–80 chars) without
          stretching across wide monitors. Set `centered: true` to horizontally center it inside
          the main column.
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" sx={{ mt: 3 }}>
          This pattern is the foundation for documentation, marketing, and long-form content
          surfaces.
        </Typography>
      </AppShell>
    </Div>
  );
}