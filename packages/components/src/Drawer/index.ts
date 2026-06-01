/**
 * Compound assembly for `<Drawer>`. Same `Object.assign(Root, { …subparts })` shape Card,
 * Accordion, Popover, Modal, etc. use. The merged value is the single canonical `Drawer` import;
 * subparts are reachable via dot syntax (`<Drawer.Trigger>`, `<Drawer.Content>`,
 * `<Drawer.Header>`, …).
 */
import { Drawer as DrawerRoot } from './Drawer';
import { DrawerBody } from './DrawerBody';
import { DrawerClose } from './DrawerClose';
import { DrawerContent } from './DrawerContent';
import { DrawerFooter } from './DrawerFooter';
import { DrawerHeader } from './DrawerHeader';
import { DrawerTrigger } from './DrawerTrigger';

export const Drawer = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Content: DrawerContent,
  Header: DrawerHeader,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
});

export type {
  DrawerBodyProps,
  DrawerCloseProps,
  DrawerContentProps,
  DrawerFooterAlign,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerOverlay,
  DrawerProps,
  DrawerSide,
  DrawerSize,
  DrawerTriggerProps,
} from './Drawer.types';