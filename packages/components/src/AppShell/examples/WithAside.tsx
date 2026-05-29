import { useState } from 'react';
import { AppShell, Button, HStack, Stack } from 'apx-ds';

export default function WithAside() {
  const [asideOpen, setAsideOpen] = useState(true);
  return (
    <div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        header={
          <HStack gap={3} className="w-full">
            <strong>Mail-style three-pane</strong>
            <Stack className="ml-auto">
              <Button size="sm" variant="ghost" onClick={() => setAsideOpen((o) => !o)}>
                {asideOpen ? 'Close panel' : 'Open panel'}
              </Button>
            </Stack>
          </HStack>
        }
        sidebar={
          <Stack gap={1} className="p-3">
            <a href="#inbox" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">📥 Inbox</a>
            <a href="#starred" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">⭐ Starred</a>
            <a href="#sent" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">📤 Sent</a>
          </Stack>
        }
        aside={
          <div className="p-4">
            <h3 className="font-semibold">Quarterly review</h3>
            <p className="mt-2 text-sm text-(--sds-color-text-muted)">
              From Alex • 2 min ago
            </p>
            <p className="mt-3 text-sm">Hi team, please find the deck attached…</p>
          </div>
        }
        asideOpen={asideOpen}
        onAsideOpenChange={setAsideOpen}
        asideWidth={300}
      >
        <Stack gap={2}>
          <div className="p-3 rounded bg-(--sds-color-surface-subtle)">Message 1</div>
          <div className="p-3 rounded bg-(--sds-color-surface-subtle)">Message 2</div>
          <div className="p-3 rounded bg-(--sds-color-surface-subtle)">Message 3</div>
        </Stack>
      </AppShell>
    </div>
  );
}
