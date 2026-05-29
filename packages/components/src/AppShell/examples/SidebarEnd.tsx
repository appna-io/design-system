import { AppShell, HStack, Stack } from '@apx-ui/ds';

export default function SidebarEnd() {
  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        header={
          <HStack gap={3} className="w-full">
            <strong>Right-aligned sidebar</strong>
            <span className="text-sm text-(--sds-color-text-muted)">
              For comments / inspector / chat surfaces
            </span>
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
        <h2 className="text-lg font-semibold">Main content first</h2>
        <p className="mt-2 text-sm text-(--sds-color-text-muted)">
          The sidebar lives on the logical-end side (right in LTR, left in RTL).
        </p>
      </AppShell>
    </div>
  );
}
