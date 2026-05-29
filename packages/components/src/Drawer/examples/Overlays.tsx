import { Button, Drawer } from '@apx-ui/ds';
import type { DrawerOverlay } from '@apx-ui/ds';

const overlays: DrawerOverlay[] = ['dimmed', 'blur', 'transparent'];

export default function Overlays() {
  return (
    <div className="flex flex-wrap gap-3">
      {overlays.map((overlay) => (
        <Drawer key={overlay}>
          <Drawer.Trigger>
            <Button variant="outline">{overlay}</Button>
          </Drawer.Trigger>
          <Drawer.Content side="right" overlay={overlay}>
            <Drawer.Close />
            <Drawer.Header title={`Overlay: ${overlay}`} />
            <Drawer.Body>
              <p className="text-sm">
                {overlay === 'blur'
                  ? 'A glassy backdrop. Use sparingly with light Content shadows.'
                  : overlay === 'transparent'
                    ? 'No backdrop tint. Best when paired with a strong Content shadow.'
                    : 'The default semi-transparent dim. Always safe.'}
              </p>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer>
      ))}
    </div>
  );
}
