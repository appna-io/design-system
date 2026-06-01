/**
 * Compound assembly for `<HoverCard>`. Same `Object.assign(Root, { …subparts })` shape Card,
 * Accordion, Popover, Modal, Drawer, etc. use. The merged value is the single canonical
 * `HoverCard` import; subparts are reachable via dot syntax (`<HoverCard.Trigger>`,
 * `<HoverCard.Content>`, `<HoverCard.Arrow>`).
 */
import { HoverCard as HoverCardRoot } from './HoverCard';
import { HoverCardArrow } from './HoverCardArrow';
import { HoverCardContent } from './HoverCardContent';
import { HoverCardTrigger } from './HoverCardTrigger';

export const HoverCard = Object.assign(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
  Arrow: HoverCardArrow,
});

export type {
  HoverCardArrowProps,
  HoverCardColor,
  HoverCardContentProps,
  HoverCardContextValue,
  HoverCardPlacement,
  HoverCardProps,
  HoverCardSize,
  HoverCardTrigger as HoverCardTriggerMode,
  HoverCardTriggerProps,
  HoverCardVariant,
} from './HoverCard.types';