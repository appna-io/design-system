import { Button, Div, Modal, Typography } from '@apx-ui/ds';
import type { ModalSize } from '@apx-ui/ds';

const sizes: ModalSize[] = ['sm', 'md', 'lg', 'xl', 'full', 'fit'];

export default function Sizes() {
  return (
    <Div display="flex" flexWrap="wrap" gap="3">
      {sizes.map((size) => (
        <Modal key={size}>
          <Modal.Trigger>
            <Button variant="outline">{size}</Button>
          </Modal.Trigger>
          <Modal.Content size={size}>
            <Modal.Close />
            <Modal.Header
              title={`Size ${size}`}
              description={`Content width follows the \`${size}\` token.`}
            />
            <Modal.Body>
              <Typography variant="bodySmall">
                Sizes drive both `max-width` on the surface and per-slot
                padding on Header / Body / Footer.
              </Typography>
            </Modal.Body>
            <Modal.Footer>
              <Modal.Close asChild>
                <Button>Done</Button>
              </Modal.Close>
            </Modal.Footer>
          </Modal.Content>
        </Modal>
      ))}
    </Div>
  );
}