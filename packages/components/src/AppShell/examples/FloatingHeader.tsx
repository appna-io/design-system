import { AppShell, HStack, Stack } from 'apx-ds';

export default function FloatingHeader() {
  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-subtle)">
      <AppShell
        headerVariant="floating"
        header={
          <HStack gap={3} className="w-full">
            <strong>Floating chrome</strong>
            <span className="text-sm text-(--sds-color-text-muted)">
              Header is detached with a shadow + rounded corners.
            </span>
          </HStack>
        }
        sidebar={
          <Stack gap={1} className="p-3">
            <a href="#overview" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Overview</a>
            <a href="#analytics" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Analytics</a>
            <a href="#reports" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Reports</a>
          </Stack>
        }
      >
        <h2 className="text-lg font-semibold">Marketing-style layout</h2>
        <p className="mt-2 text-sm text-(--sds-color-text-muted)">
          Pair `headerVariant=&quot;floating&quot;` with `layout=&quot;inset&quot;` for a
          Notion-marketing look.
        </p>
      </AppShell>
    </div>
  );
}
