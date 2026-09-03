import { useState } from 'react';
import { AppShell, Button, Div, HStack, Stack, Typography } from '@apx-ui/ds';

export default function WithAside() {
  const [asideOpen, setAsideOpen] = useState(true);
  return (
    <Div className="h-[420px] overflow-hidden rounded-md border border-border-subtle">
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
            <a href="#inbox" className="px-2 py-1 rounded hover:bg-bg-subtle">📥 Inbox</a>
            <a href="#starred" className="px-2 py-1 rounded hover:bg-bg-subtle">⭐ Starred</a>
            <a href="#sent" className="px-2 py-1 rounded hover:bg-bg-subtle">📤 Sent</a>
          </Stack>
        }
        aside={
          <Div className="p-4">
            <Typography as="h3" variant="body" weight="semibold">
              Quarterly review
            </Typography>
            <Typography variant="bodySmall" color="fg.muted" sx={{ mt: 2 }}>
              From Alex • 2 min ago
            </Typography>
            <Typography variant="bodySmall" sx={{ mt: 3 }}>
              Hi team, please find the deck attached…
            </Typography>
          </Div>
        }
        asideOpen={asideOpen}
        onAsideOpenChange={setAsideOpen}
        asideWidth={300}
      >
        <Stack gap={2}>
          <Div className="p-3 rounded bg-bg-subtle">Message 1</Div>
          <Div className="p-3 rounded bg-bg-subtle">Message 2</Div>
          <Div className="p-3 rounded bg-bg-subtle">Message 3</Div>
        </Stack>
      </AppShell>
    </Div>
  );
}