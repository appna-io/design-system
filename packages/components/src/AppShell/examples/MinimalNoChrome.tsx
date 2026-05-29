import { AppShell } from '@apx-ui/ds';

export default function MinimalNoChrome() {
  return (
    <div className="h-[320px] overflow-hidden rounded-md border border-(--sds-color-border-subtle)">
      <AppShell skipToContent={false}>
        <div className="grid place-items-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold">No header, no sidebar, no footer</h2>
            <p className="mt-2 text-sm text-(--sds-color-text-muted)">
              AppShell still gives you the &lt;main&gt; landmark and a focusable skip-link
              (toggled off here just to keep the demo clean).
            </p>
          </div>
        </div>
      </AppShell>
    </div>
  );
}
