import { createContext, useContext } from 'react';

import type { RadioColor, RadioGroupOrientation, RadioSize, RadioVariant } from './Radio.types';

/**
 * The value a `<RadioGroup>` puts on the wire for its `<Radio>` children. Children read this via
 * `useRadioGroup()`; absence of the context (i.e. a standalone `<Radio>`) is the documented
 * escape hatch and the hook returns `null` in that case.
 *
 * The variant / size / color fields are **defaults** propagated from the group. Each child can
 * still override locally; we just give the group a way to set sensible per-group defaults so a
 * three-radio "Size" picker doesn't have to repeat `size="sm"` on every child.
 */
export interface RadioGroupContextValue {
  /** Currently selected value, or `undefined` if nothing is selected yet. */
  value: string | undefined;
  /** Imperative setter wired to the group's `useControllableState`. */
  setValue: (next: string) => void;
  /** Shared `name` attribute applied to every child input. */
  name: string | undefined;
  /** Group-wide disabled flag. Children OR this with their own `disabled`. */
  disabled: boolean;
  /** Group-wide invalid flag. Children OR this with their own `invalid`. */
  invalid: boolean;
  /** Default `variant` if a child does not specify one. */
  variant: RadioVariant | undefined;
  /** Default `size` if a child does not specify one. */
  size: RadioSize | undefined;
  /** Default `color` if a child does not specify one. */
  color: RadioColor | undefined;
  /** Layout axis — informational, used by children only for dev assertions today. */
  orientation: RadioGroupOrientation;
}

/**
 * `null` when consumed from outside a `<RadioGroup>` (e.g. a standalone `<Radio>`). Components
 * MUST treat `null` as the no-op case rather than crashing — Radio's escape hatch depends on it.
 */
export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/**
 * Read the current `<RadioGroup>` context, or `null` if rendered outside one. Components that
 * only make sense inside a group should still tolerate `null` and degrade to standalone
 * behavior — Radio is the canonical example.
 */
export function useRadioGroup(): RadioGroupContextValue | null {
  return useContext(RadioGroupContext);
}