import { Button, Drawer } from '@apx-ui/ds';
import type { DrawerSide } from '@apx-ui/ds';

const sides: DrawerSide[] = ['left', 'right', 'top', 'bottom'];

export default function Sides() {
  return (
    <div className="flex flex-wrap gap-3">
      {sides.map((side) => (
        <Drawer key={side}>
          <Drawer.Trigger>
            <Button variant="outline">{side}</Button>
          </Drawer.Trigger>
          <Drawer.Content side={side}>
            <Drawer.Close />
            <Drawer.Header title={`Side: ${side}`} />
            <Drawer.Body>
              <p className="text-sm">
                {side === 'left' || side === 'right'
                  ? 'Horizontal drawers control width via the size axis.'
                  : 'Vertical drawers control height via the size axis. Useful for bottom sheets and announcement banners.'}
              </p>
            </Drawer.Body>
            <Drawer.Footer>
              <Drawer.Close asChild>
                <Button>Done</Button>
              </Drawer.Close>
            </Drawer.Footer>
          </Drawer.Content>
        </Drawer>
      ))}
    </div>
  );
}
