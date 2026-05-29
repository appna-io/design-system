/**
 * Compound assembly for `<Menu>`. Same `Object.assign(Root, { …subparts })` shape Card, Accordion,
 * Popover, etc. use — but this is the biggest one yet at 13 subparts.
 *
 * Author convention: keep the subpart list alphabetized by export key (not by file name). Makes
 * the public surface easier to scan in the IDE.
 */
import { Menu as MenuRoot } from './Menu';
import { MenuCheckboxItem } from './MenuCheckboxItem';
import { MenuContent } from './MenuContent';
import { MenuGroup } from './MenuGroup';
import { MenuItem } from './MenuItem';
import { MenuLabel } from './MenuLabel';
import { MenuRadioGroup } from './MenuRadioGroup';
import { MenuRadioItem } from './MenuRadioItem';
import { MenuSeparator } from './MenuSeparator';
import { MenuSub } from './MenuSub';
import { MenuSubContent } from './MenuSubContent';
import { MenuSubTrigger } from './MenuSubTrigger';
import { MenuTrigger } from './MenuTrigger';

export const Menu = Object.assign(MenuRoot, {
  CheckboxItem: MenuCheckboxItem,
  Content: MenuContent,
  Group: MenuGroup,
  Item: MenuItem,
  Label: MenuLabel,
  RadioGroup: MenuRadioGroup,
  RadioItem: MenuRadioItem,
  Separator: MenuSeparator,
  Sub: MenuSub,
  SubContent: MenuSubContent,
  SubTrigger: MenuSubTrigger,
  Trigger: MenuTrigger,
});

export type {
  MenuCheckboxItemProps,
  MenuColor,
  MenuContentProps,
  MenuGroupProps,
  MenuItemColor,
  MenuItemProps,
  MenuLabelProps,
  MenuPlacement,
  MenuProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSeparatorProps,
  MenuSize,
  MenuSubContentProps,
  MenuSubProps,
  MenuSubTriggerProps,
  MenuTriggerKind,
  MenuTriggerProps,
  MenuVariant,
} from './Menu.types';
