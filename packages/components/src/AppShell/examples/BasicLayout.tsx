import { AppShell, HStack, Stack } from 'apx-ds';

export default function BasicLayout() {
  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        header={
          <HStack gap={3} className="w-full">
            <strong>Acme</strong>
            <span className="text-sm text-(--sds-color-text-muted)">Dashboard</span>
          </HStack>
        }
        sidebar={
          <Stack gap={1} className="p-3">
            <a href="#home" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Home</a>
            <a href="#projects" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Projects</a>
            <a href="#reports" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Reports</a>
            <a href="#settings" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Settings</a>
          </Stack>
        }
        footer={<span>© 2026 Acme, Inc.</span>}
      >
        <h2 className="text-lg font-semibold">Welcome back</h2>
        <p className="mt-2 text-sm text-(--sds-color-text-muted)">
          Pick a section from the sidebar to begin.
        </p>
      </AppShell>
    </div>
  );
}
