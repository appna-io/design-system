import { Button, Div, Modal, Typography } from '@apx-ui/ds';
import type { ModalOverlay } from '@apx-ui/ds';

const overlays: ModalOverlay[] = ['dimmed', 'blur', 'transparent'];

export default function Overlays() {
  return (
    <Div display="flex" flexWrap="wrap" gap="3">
      {overlays.map((overlay) => (
        <Modal key={overlay}>
          <Modal.Trigger>
            <Button variant="outline">{overlay}</Button>
          </Modal.Trigger>
          <Modal.Content overlay={overlay}>
            <Modal.Close />
            <Modal.Header title={`Overlay: ${overlay}`} />
            <Modal.Body>
              <Typography variant="bodySmall">
                {overlay === 'blur'
                  ? 'A glassy backdrop. Use sparingly — it can hurt readability of the page behind it.'
                  : overlay === 'transparent'
                    ? 'No backdrop tint. Best when paired with a light Content shadow that stands out on its own.'
                    : 'The default semi-transparent dim. Always safe.'}
              </Typography>
            </Modal.Body>
          </Modal.Content>
        </Modal>
      ))}
    </Div>
  );
}