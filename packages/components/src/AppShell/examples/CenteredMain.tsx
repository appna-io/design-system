import { AppShell, HStack, Stack } from 'apx-ds';

export default function CenteredMain() {
  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        header={
          <HStack gap={3} className="w-full">
            <strong>Docs site</strong>
            <span className="text-sm text-(--sds-color-text-muted)">
              max-width main with centered content
            </span>
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
        <h1 className="text-2xl font-semibold">Body content stays readable</h1>
        <p className="mt-3 text-sm text-(--sds-color-text-muted)">
          Use `main.maxWidth` to keep prose at a comfortable measure (60–80 chars) without
          stretching across wide monitors. Set `centered: true` to horizontally center it inside
          the main column.
        </p>
        <p className="mt-3 text-sm text-(--sds-color-text-muted)">
          This pattern is the foundation for documentation, marketing, and long-form content
          surfaces.
        </p>
      </AppShell>
    </div>
  );
}
