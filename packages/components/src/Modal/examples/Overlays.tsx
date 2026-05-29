import { Button, Modal } from 'apx-ds';
import type { ModalOverlay } from 'apx-ds';

const overlays: ModalOverlay[] = ['dimmed', 'blur', 'transparent'];

export default function Overlays() {
  return (
    <div className="flex flex-wrap gap-3">
      {overlays.map((overlay) => (
        <Modal key={overlay}>
          <Modal.Trigger>
            <Button variant="outline">{overlay}</Button>
          </Modal.Trigger>
          <Modal.Content overlay={overlay}>
            <Modal.Close />
            <Modal.Header title={`Overlay: ${overlay}`} />
            <Modal.Body>
              <p className="text-sm">
                {overlay === 'blur'
                  ? 'A glassy backdrop. Use sparingly — it can hurt readability of the page behind it.'
                  : overlay === 'transparent'
                    ? 'No backdrop tint. Best when paired with a light Content shadow that stands out on its own.'
                    : 'The default semi-transparent dim. Always safe.'}
              </p>
            </Modal.Body>
          </Modal.Content>
        </Modal>
      ))}
    </div>
  );
}
