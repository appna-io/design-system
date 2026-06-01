/**
 * Compound assembly for `<Select>`. 8 subparts assembled via the same `Object.assign(Root, { … })`
 * shape every other DS compound uses (Card, Accordion, Popover, Menu).
 *
 * Author convention: keep the subpart list alphabetized by export key. Makes the public surface
 * easier to scan in the IDE.
 */
import { Select as SelectRoot } from './Select';
import { SelectContent } from './SelectContent';
import { SelectGroup } from './SelectGroup';
import { SelectItem } from './SelectItem';
import { SelectItemIndicator } from './SelectItemIndicator';
import { SelectLabel } from './SelectLabel';
import { SelectSeparator } from './SelectSeparator';
import { SelectTrigger } from './SelectTrigger';

export const Select = Object.assign(SelectRoot, {
  Content: SelectContent,
  Group: SelectGroup,
  Item: SelectItem,
  ItemIndicator: SelectItemIndicator,
  Label: SelectLabel,
  Separator: SelectSeparator,
  Trigger: SelectTrigger,
});

export type {
  SelectColor,
  SelectContentProps,
  SelectContentVariant,
  SelectGroupProps,
  SelectItemIndicatorProps,
  SelectItemProps,
  SelectLabelProps,
  SelectPlacement,
  SelectProps,
  SelectSeparatorProps,
  SelectSize,
  SelectTriggerProps,
  SelectVariant,
} from './Select.types';