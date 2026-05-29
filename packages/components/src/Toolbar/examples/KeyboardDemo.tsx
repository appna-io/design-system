import { Button, Stack, Toolbar } from 'apx-ds';

export default function KeyboardDemo() {
  return (
    <Stack gap={3}>
      <div className="rounded-md border border-border bg-bg-subtle p-3 text-sm text-fg-muted">
        <p className="mb-2 font-medium text-fg-default">Keyboard pattern</p>
        <ul className="ml-4 list-disc space-y-1">
          <li>
            <kbd className="rounded border border-border bg-bg-paper px-1.5 text-xs">Tab</kbd>
            {' '}
            enters the toolbar. Only the first focusable item is in the tab order.
          </li>
          <li>
            <kbd className="rounded border border-border bg-bg-paper px-1.5 text-xs">←</kbd>
            {' / '}
            <kbd className="rounded border border-border bg-bg-paper px-1.5 text-xs">→</kbd>
            {' '}
            move focus between items.
          </li>
          <li>
            <kbd className="rounded border border-border bg-bg-paper px-1.5 text-xs">Home</kbd>
            {' / '}
            <kbd className="rounded border border-border bg-bg-paper px-1.5 text-xs">End</kbd>
            {' '}
            jump to the first / last item.
          </li>
          <li>Disabled items are skipped during arrow navigation.</li>
        </ul>
      </div>

      <Toolbar variant="bordered" aria-label="Keyboard demo">
        <Button variant="ghost">Alpha</Button>
        <Button variant="ghost">Beta</Button>
        <Button variant="ghost" disabled>
          Gamma (disabled)
        </Button>
        <Button variant="ghost">Delta</Button>
        <Toolbar.Separator />
        <Button variant="ghost">Epsilon</Button>
      </Toolbar>
    </Stack>
  );
}
