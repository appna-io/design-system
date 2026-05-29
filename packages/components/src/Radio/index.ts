/**
 * Radio + RadioGroup public surface.
 *
 * Two named exports, **not** a compound `Radio.Group`:
 *
 *   - `<RadioGroup>` is the canonical entrypoint. Carries the selected value, propagates name /
 *     variant / size / color defaults, owns the controlled-vs-uncontrolled dance, sets ARIA
 *     `role="radiogroup"`.
 *   - `<Radio>` is the per-option indicator. Useful inside a group (99% of cases) and as a
 *     documented escape hatch outside one (testing, ad-hoc form rows). Native HTML's
 *     `name`-based grouping still works without `<RadioGroup>` for the rare standalone case.
 *
 * Mirrors how Radix / Mantine / MUI ship this pair — keeps the discoverability tight without
 * forcing `Radio.Group` on consumers who only want the group.
 */
export { Radio } from './Radio';
export { RadioGroup } from './RadioGroup';
export { useRadioGroup } from './RadioGroupContext';
export type { RadioGroupContextValue } from './RadioGroupContext';

export type {
  RadioColor,
  RadioGroupOrientation,
  RadioGroupProps,
  RadioLabelPosition,
  RadioProps,
  RadioSize,
  RadioVariant,
} from './Radio.types';
