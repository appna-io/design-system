/**
 * Compound assembly for `<Popover>`. Same `Object.assign(Root, { …subparts })` shape Card,
 * Accordion, etc. use. The merged value is the single canonical `Popover` import; subparts are
 * reachable via dot syntax (`<Popover.Trigger>`, `<Popover.Content>`, …).
 */
import { Popover as PopoverRoot } from './Popover';
import { PopoverArrow } from './PopoverArrow';
import { PopoverClose } from './PopoverClose';
import { PopoverContent } from './PopoverContent';
import { PopoverTrigger } from './PopoverTrigger';

export const Popover = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Arrow: PopoverArrow,
  Close: PopoverClose,
});

export type {
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverColor,
  PopoverContentProps,
  PopoverPlacement,
  PopoverProps,
  PopoverSize,
  PopoverTriggerProps,
  PopoverVariant,
} from './Popover.types';
