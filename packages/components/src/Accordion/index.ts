/**
 * Compound assembly for `<Accordion>`. Same shape Card uses (see `Card/index.ts`): import the
 * root + each subpart, wrap them via `Object.assign`, re-export the merged value as the public
 * name. Lets consumers write `<Accordion.Item>` / `<Accordion.Trigger>` / `<Accordion.Content>`
 * without pulling subparts from deep import paths.
 *
 * The Tabs / Modal / Drawer / Menu phases will copy this shape — keeping every compound
 * component on one assembly recipe is what keeps the renderer's per-subpart docs uniform and
 * the bundler's tree-shaking story predictable.
 */
import { AccordionRoot } from './Accordion';
import { AccordionContent } from './AccordionContent';
import { AccordionItem } from './AccordionItem';
import { AccordionTrigger } from './AccordionTrigger';

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

export type {
  AccordionColor,
  AccordionContentProps,
  AccordionIconPosition,
  AccordionItemProps,
  AccordionProps,
  AccordionSize,
  AccordionTriggerProps,
  AccordionVariant,
} from './Accordion.types';