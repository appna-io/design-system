import { AppShell, Button, HStack, Stack, useAppShell } from '@apx-ui/ds';

function HeaderBar() {
  const { toggleSidebar, isSidebarCollapsed } = useAppShell();
  return (
    <HStack gap={3} className="w-full">
      <Button variant="ghost" size="sm" onClick={toggleSidebar} aria-label="Toggle sidebar">
        ☰
      </Button>
      <strong>Linear-style rail</strong>
      <span className="text-sm text-(--sds-color-text-muted)">
        ({isSidebarCollapsed ? 'collapsed' : 'expanded'})
      </span>
    </HStack>
  );
}

export default function CollapsibleSidebar() {
  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        header={<HeaderBar />}
        sidebar={
          <Stack gap={1} className="p-3">
            <a href="#home" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">🏠 Home</a>
            <a href="#projects" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">📦 Projects</a>
            <a href="#settings" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">⚙️ Settings</a>
          </Stack>
        }
        sidebarWidth={220}
        sidebarCollapsedWidth={56}
      >
        <h2 className="text-lg font-semibold">Click ☰ to collapse</h2>
        <p className="mt-2 text-sm text-(--sds-color-text-muted)">
          The sidebar smoothly transitions between full and rail widths.
        </p>
      </AppShell>
    </div>
  );
}
