import { AppShell, Button, Div, Typography } from '@apx-ui/ds';

/**
 * `headerScroll="condense"` — the house style. Scroll the panel below: the header gains a border,
 * a translucent background and a blur once real content is behind it.
 *
 * The state is also on the element as `data-scrolled`, so the brand mark shrinking here is the
 * consumer's own CSS hanging off the DS's listener rather than a second listener.
 */
export default function HeaderScroll() {
  return (
    <Div className="h-[420px] overflow-y-auto rounded-xl border border-border">
      <AppShell
        headerScroll="condense"
        header={
          <Div className="flex w-full items-center justify-between gap-4">
            <Typography
              weight="bold"
              className="transition-[font-size] duration-normal ease-standard text-lg group-data-[scrolled]:text-base"
            >
              Northwind
            </Typography>
            <Button size="sm">Get started</Button>
          </Div>
        }
      >
        <Div className="space-y-4 p-6">
          <Typography as="h2" variant="h3" weight="bold">
            Scroll this panel
          </Typography>
          {Array.from({ length: 12 }, (_, i) => (
            <Typography key={i} color="foreground.muted">
              The header condenses once the page is past the fold, so it stays legible over content
              instead of floating transparently on top of it.
            </Typography>
          ))}
        </Div>
      </AppShell>
    </Div>
  );
}
