import { AppShell, Div, HStack, Stack, Typography } from '@apx-ui/ds';

export default function FloatingHeader() {
  return (
    <Div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-subtle)">
      <AppShell
        headerVariant="floating"
        header={
          <HStack gap={3} className="w-full">
            <strong>Floating chrome</strong>
            <Typography as="span" variant="bodySmall" color="fg.muted">
              Header is detached with a shadow + rounded corners.
            </Typography>
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
        <Typography as="h2" variant="h6" weight="semibold">
          Marketing-style layout
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" sx={{ mt: 2 }}>
          Pair `headerVariant=&quot;floating&quot;` with `layout=&quot;inset&quot;` for a
          Notion-marketing look.
        </Typography>
      </AppShell>
    </Div>
  );
}