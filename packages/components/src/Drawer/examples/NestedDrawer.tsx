import { Button, Div, Drawer, Typography } from '@apx-ui/ds';

export default function NestedDrawer() {
  return (
    <Drawer>
      <Drawer.Trigger>
        <Button>Open outer drawer</Button>
      </Drawer.Trigger>
      <Drawer.Content side="right" size="md">
        <Drawer.Close />
        <Drawer.Header
          title="Outer drawer"
          description="Open the inner drawer to test the escape stack."
        />
        <Drawer.Body>
          <Typography variant="bodySmall">
            Pressing <kbd>Escape</kbd> closes the topmost drawer first. The
            engine&apos;s escape-stack ordering ensures only one layer unwinds
            per press.
          </Typography>
          <Div className="mt-4">
            <Drawer>
              <Drawer.Trigger>
                <Button variant="outline">Open inner</Button>
              </Drawer.Trigger>
              <Drawer.Content side="left" size="sm">
                <Drawer.Close />
                <Drawer.Header title="Inner drawer" />
                <Drawer.Body>
                  <Typography variant="bodySmall">
                    Pressing Escape here closes only this drawer. The outer
                    one stays open.
                  </Typography>
                </Drawer.Body>
                <Drawer.Footer>
                  <Drawer.Close asChild>
                    <Button>Close inner</Button>
                  </Drawer.Close>
                </Drawer.Footer>
              </Drawer.Content>
            </Drawer>
          </Div>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button>Close outer</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}