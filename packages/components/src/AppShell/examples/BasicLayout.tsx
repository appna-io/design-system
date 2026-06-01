import { AppShell, Div, HStack, Stack, Typography } from '@apx-ui/ds';

export default function BasicLayout() {
  return (
    <Div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        header={
          <HStack gap={3} className="w-full">
            <strong>Acme</strong>
            <Typography as="span" variant="bodySmall" color="fg.muted">
              Dashboard
            </Typography>
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
        footer={
          <Typography as="span" variant="bodySmall" color="fg.muted">
            © 2026 Acme, Inc.
          </Typography>
        }
      >
        <Typography as="h2" variant="titleSmall" weight="semibold">
          Welcome back
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" sx={{ mt: 2 }}>
          Pick a section from the sidebar to begin.
        </Typography>
      </AppShell>
    </Div>
  );
}