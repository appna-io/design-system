/**
 * Public surface for the Stack family — four primitives shipped together because their semantics
 * compose. `<Stack>` is the generic flex container; `<HStack>` / `<VStack>` are aliases that
 * lock `direction` for cleaner call sites; `<Spacer>` is the partner separator (greedy or fixed)
 * that the Stack's divider-insertion logic recognizes via the `__sds_spacer` marker.
 *
 * No compound dot-namespace here (no `Stack.Spacer`) — Spacer is genuinely useful as a top-level
 * primitive too (`<HStack><Tabs /><Spacer /><UserMenu /></HStack>`), so it ships as a sibling
 * export, exactly like `Toggle` + `ToggleGroup`.
 */
export { Stack } from './Stack';
export { HStack } from './HStack';
export { VStack } from './VStack';
export { Spacer } from './Spacer';

export {
  stackChildrenWithDivider,
  isSpacer,
  SPACER_MARKER,
} from './stackChildrenWithDivider';

export type {
  HVStackProps,
  SpacerAxis,
  SpacerProps,
  SpacerSize,
  StackAlign,
  StackAs,
  StackDirection,
  StackGap,
  StackJustify,
  StackProps,
  StackWrap,
} from './Stack.types';
