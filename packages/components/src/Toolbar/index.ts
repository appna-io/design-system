/**
 * Compound assembly for `<Toolbar>` — same `Object.assign(Root, { …subparts })` shape used by
 * Card / Accordion / Popover / Menu. The three subparts are alphabetized by export key to keep
 * the public surface scannable.
 *
 * Why a compound + three subparts (and not four exports):
 *  - `Toolbar.Group` / `Toolbar.Separator` are toolbar-specific and have no useful meaning
 *    outside a toolbar. They consume `ToolbarContext` for orientation-aware behavior.
 *  - `Toolbar.Spacer` is a thin wrapper over the shipped `<Spacer>` from the Stack family — it
 *    adds `data-toolbar-skip` and a `data-toolbar-spacer` hook but otherwise inherits Spacer's
 *    behavior. Bare consumers can use `<Spacer>` directly; using `Toolbar.Spacer` inside a
 *    toolbar is the conventional, semantically-explicit form.
 *
 * `resolveNextToolbarIndex` and `measureOverflowCount` are exported so consumers (and future
 * Toolbar-style components) can reuse the pure resolvers without importing React. The hooks
 * themselves stay component-local — Toolbar-only consumers per @SDS-Leader's Phase 44 guardrail.
 */
import { Toolbar as ToolbarRoot } from './Toolbar';
import { ToolbarGroup } from './ToolbarGroup';
import { ToolbarSeparator } from './ToolbarSeparator';
import { ToolbarSpacer } from './ToolbarSpacer';

export const Toolbar = Object.assign(ToolbarRoot, {
  Group: ToolbarGroup,
  Separator: ToolbarSeparator,
  Spacer: ToolbarSpacer,
});

export { resolveNextToolbarIndex } from './useToolbarKeyboard';
export { measureOverflowCount } from './useToolbarOverflow';

export type {
  ToolbarAlign,
  ToolbarContextValue,
  ToolbarGroupProps,
  ToolbarOrientation,
  ToolbarOverflowStrategy,
  ToolbarProps,
  ToolbarSeparatorProps,
  ToolbarSize,
  ToolbarSpacerProps,
  ToolbarVariant,
} from './Toolbar.types';