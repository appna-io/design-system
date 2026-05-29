import { Button, Drawer } from '@apx-ui/ds';

/**
 * One of the headline patterns Drawer enables: bottom-sheet on mobile, side-drawer on desktop.
 * The `side` prop accepts a `ResponsiveValue`, so the same component spec works across breakpoints
 * without any conditional rendering or media-query JS in user code.
 */
export default function ResponsiveSide() {
  return (
    <Drawer>
      <Drawer.Trigger>
        <Button>Open responsive drawer</Button>
      </Drawer.Trigger>
      <Drawer.Content
        side={{ base: 'bottom', md: 'right' }}
        size={{ base: 'lg', md: 'md' }}
      >
        <Drawer.Close />
        <Drawer.Header
          title="Responsive drawer"
          description="Bottom sheet on mobile, right drawer on desktop."
        />
        <Drawer.Body>
          <p className="text-sm">
            Resize the viewport across the `md` breakpoint to see the panel
            switch sides without any rerender or layout glitch.
          </p>
        </Drawer.Body>
        <Drawer.Footer>
          <Drawer.Close asChild>
            <Button>Done</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
