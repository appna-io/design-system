/**
 * Compound assembly for `<Modal>`. Same `Object.assign(Root, { …subparts })` shape Card, Accordion,
 * Popover, etc. use. The merged value is the single canonical `Modal` import; subparts are reachable
 * via dot syntax (`<Modal.Trigger>`, `<Modal.Content>`, `<Modal.Header>`, …).
 */
import { Modal as ModalRoot } from './Modal';
import { ModalBody } from './ModalBody';
import { ModalClose } from './ModalClose';
import { ModalContent } from './ModalContent';
import { ModalFooter } from './ModalFooter';
import { ModalHeader } from './ModalHeader';
import { ModalTrigger } from './ModalTrigger';

export const Modal = Object.assign(ModalRoot, {
  Trigger: ModalTrigger,
  Content: ModalContent,
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
  Close: ModalClose,
});

export type {
  ModalBodyProps,
  ModalCloseProps,
  ModalContentProps,
  ModalFooterAlign,
  ModalFooterProps,
  ModalHeaderProps,
  ModalOverlay,
  ModalPlacement,
  ModalProps,
  ModalSize,
  ModalTriggerProps,
  ModalVariant,
} from './Modal.types';