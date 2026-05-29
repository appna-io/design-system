import { Button, Drawer } from '@apx-ui/ds';
import type { DrawerSize } from '@apx-ui/ds';

const sizes: DrawerSize[] = ['sm', 'md', 'lg', 'xl', 'full'];

export default function Sizes() {
  return (
    <div className="flex flex-wrap gap-3">
      {sizes.map((size) => (
        <Drawer key={size}>
          <Drawer.Trigger>
            <Button variant="outline">{size}</Button>
          </Drawer.Trigger>
          <Drawer.Content side="right" size={size}>
            <Drawer.Close />
            <Drawer.Header
              title={`Size ${size}`}
              description={`Width follows the \`${size}\` token.`}
            />
            <Drawer.Body>
              <p className="text-sm">
                Sizes drive the dimension perpendicular to the anchored edge.
                For a right drawer that means width; for a top drawer that
                means height.
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
