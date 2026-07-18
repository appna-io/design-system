import { AppShell, Div, HStack, Stack, Typography } from '@apx-ui/ds';

export default function InsetLayout() {
  return (
    <Div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        layout="inset"
        header={
          <HStack gap={3} className="w-full">
            <strong>GitHub-style header</strong>
            <Typography as="span" variant="bodySmall" color="fg.muted">
              spans the full width of the screen
            </Typography>
          </HStack>
        }
        sidebar={
          <Stack gap={1} className="p-3">
            <a href="#pulls" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Pulls</a>
            <a href="#issues" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Issues</a>
            <a href="#discussions" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">Discussions</a>
          </Stack>
        }
      >
        <Typography as="h2" variant="h6" weight="semibold">
          Inset variant
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" sx={{ mt: 2 }}>
          Header lives above both sidebar and main content.
        </Typography>
      </AppShell>
    </Div>
  );
}