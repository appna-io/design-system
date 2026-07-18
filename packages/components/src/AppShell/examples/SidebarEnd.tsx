import { AppShell, Div, HStack, Stack, Typography } from '@apx-ui/ds';

export default function SidebarEnd() {
  return (
    <Div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        header={
          <HStack gap={3} className="w-full">
            <strong>Right-aligned sidebar</strong>
            <Typography as="span" variant="bodySmall" color="fg.muted">
              For comments / inspector / chat surfaces
            </Typography>
          </HStack>
        }
        sidebar={
          <Stack gap={1} className="p-3">
            <a href="#comments" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">💬 Comments</a>
            <a href="#properties" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">🎛 Properties</a>
            <a href="#history" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">📜 History</a>
          </Stack>
        }
        sidebarPosition="end"
      >
        <Typography as="h2" variant="h6" weight="semibold">
          Main content first
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" sx={{ mt: 2 }}>
          The sidebar lives on the logical-end side (right in LTR, left in RTL).
        </Typography>
      </AppShell>
    </Div>
  );
}