import { AppShell, Button, Div, HStack, Stack, Typography, useAppShell } from '@apx-ui/ds';

function HeaderBar() {
  const { toggleSidebar, isSidebarCollapsed } = useAppShell();
  return (
    <HStack gap={3} className="w-full">
      <Button variant="ghost" size="sm" onClick={toggleSidebar} aria-label="Toggle sidebar">
        ☰
      </Button>
      <strong>Linear-style rail</strong>
      <Typography as="span" variant="bodySmall" color="fg.muted">
        ({isSidebarCollapsed ? 'collapsed' : 'expanded'})
      </Typography>
    </HStack>
  );
}

export default function CollapsibleSidebar() {
  return (
    <Div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
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
        <Typography as="h2" variant="h6" weight="semibold">
          Click ☰ to collapse
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" sx={{ mt: 2 }}>
          The sidebar smoothly transitions between full and rail widths.
        </Typography>
      </AppShell>
    </Div>
  );
}