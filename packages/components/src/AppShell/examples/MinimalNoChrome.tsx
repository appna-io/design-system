import { AppShell, Div, Typography } from '@apx-ui/ds';

export default function MinimalNoChrome() {
  return (
    <Div className="h-[320px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell skipToContent={false}>
        <Div className="grid place-items-center h-full">
          <Div className="text-center">
            <Typography as="h2" variant="titleSmall" weight="semibold">
              No header, no sidebar, no footer
            </Typography>
            <Typography variant="bodySmall" color="fg.muted" sx={{ mt: 2 }}>
              AppShell still gives you the &lt;main&gt; landmark and a focusable skip-link
              (toggled off here just to keep the demo clean).
            </Typography>
          </Div>
        </Div>
      </AppShell>
    </Div>
  );
}