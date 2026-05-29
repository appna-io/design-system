import { AppShell, HStack, Stack } from 'apx-ds';

export default function InsetLayout() {
  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        layout="inset"
        header={
          <HStack gap={3} className="w-full">
            <strong>GitHub-style header</strong>
            <span className="text-sm text-(--sds-color-text-muted)">
              spans the full width of the screen
            </span>
          </HStack>
        }
        sidebar={
          <Stack gap={1} className="p-3">
            <a href="#pulls" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Pulls</a>
            <a href="#issues" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Issues</a>
            <a href="#discussions" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Discussions</a>
          </Stack>
        }
      >
        <h2 className="text-lg font-semibold">Inset variant</h2>
        <p className="mt-2 text-sm text-(--sds-color-text-muted)">
          Header lives above both sidebar and main content.
        </p>
      </AppShell>
    </div>
  );
}
