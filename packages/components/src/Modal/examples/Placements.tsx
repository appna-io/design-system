import { Button, Modal } from 'apx-ds';
import type { ModalPlacement } from 'apx-ds';

const placements: ModalPlacement[] = ['center', 'top'];

export default function Placements() {
  return (
    <div className="flex flex-wrap gap-3">
      {placements.map((placement) => (
        <Modal key={placement}>
          <Modal.Trigger>
            <Button variant="outline">{placement}</Button>
          </Modal.Trigger>
          <Modal.Content placement={placement}>
            <Modal.Close />
            <Modal.Header title={`Placement: ${placement}`} />
            <Modal.Body>
              <p className="text-sm">
                {placement === 'top'
                  ? 'Top-anchored modals are useful when content is tall and the user expects to scan from the top.'
                  : 'Center is the default — symmetric, conventional, hard to misuse.'}
              </p>
            </Modal.Body>
          </Modal.Content>
        </Modal>
      ))}
    </div>
  );
}
