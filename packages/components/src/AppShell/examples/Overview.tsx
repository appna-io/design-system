import { AppShell, Div, HStack, Stack, Typography } from '@apx-ui/ds';

/**
 * Quick-review demo of `<AppShell />` — a realistic dashboard frame with header, sidebar
 * navigation, footer, and main content area.
 */
export default function Overview() {
  return (
    <Div className="h-[420px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell
        header={
          <HStack gap={3} className="w-full">
            <strong>Northwind</strong>
            <Typography as="span" variant="bodySmall" color="fg.muted">
              Operations dashboard
            </Typography>
          </HStack>
        }
        sidebar={
          <Stack gap={1} className="p-3">
            <a href="#overview" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">
              Overview
            </a>
            <a href="#orders" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">
              Orders
            </a>
            <a href="#inventory" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">
              Inventory
            </a>
            <a href="#team" className="px-2 py-1 rounded hover:bg-(--sds-color-surface-subtle)">
              Team
            </a>
          </Stack>
        }
        footer={
          <Typography as="span" variant="bodySmall" color="fg.muted">
            © 2026 Northwind Traders
          </Typography>
        }
      >
        <Typography as="h2" variant="titleSmall" weight="semibold">
          Good morning, Alex
        </Typography>
        <Typography variant="bodySmall" color="fg.muted" sx={{ mt: 2 }}>
          12 orders shipped overnight · 3 items below reorder threshold
        </Typography>
      </AppShell>
    </Div>
  );
}