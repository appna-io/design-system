import { Button, Div, Drawer, Typography } from '@apx-ui/ds';

export default function ScrollableBody() {
  const sections = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <Drawer>
      <Drawer.Trigger>
        <Button>Open long drawer</Button>
      </Drawer.Trigger>
      <Drawer.Content side="right" size="md">
        <Drawer.Close />
        <Drawer.Header
          title="Activity log"
          description="All recent events for this account."
        />
        <Drawer.Body>
          <Div className="space-y-3">
            {sections.map((n) => (
              <Typography key={n} variant="bodySmall">
                Event {n}. Body scrolls inside the panel while Header and
                Footer stay pinned at the top and bottom edges. The
                drawer&apos;s `h-full` keeps it inside the viewport regardless
                of content length.
              </Typography>
            ))}
          </Div>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button>Close</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}