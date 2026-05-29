/**
 * Pure derivation of the ARIA attributes an Icon should render based on the consumer's a11y
 * intent. Three input axes collapse to one of two outcomes (meaningful vs decorative) — the
 * function exists because the precedence rules ("explicit decorative wins over label", "label
 * removes aria-hidden", "missing both defaults to decorative") would otherwise sprawl across
 * the render path.
 *
 * Truth table:
 *
 * | label  | decorative | → role  | aria-label | aria-hidden |
 * | ------ | ---------- | ------- | ---------- | ----------- |
 * | "X"    | undefined  | 'img'   | "X"        | undefined   |
 * | "X"    | true       | undefined | undefined | true        |  ← explicit override wins
 * | undef  | true       | undefined | undefined | true        |
 * | undef  | false      | undefined | undefined | true        |  ← still decorative; no label
 * | undef  | undefined  | undefined | undefined | true        |  ← decorative-by-default
 * | ""     | undefined  | undefined | undefined | true        |  ← empty label = decorative
 *
 * Unit-tested across every permutation in `resolveIconA11y.test.ts`.
 */
export interface ResolveIconA11yInput {
  label?: string;
  decorative?: boolean;
}

export interface ResolveIconA11yOutput {
  role: 'img' | undefined;
  'aria-label': string | undefined;
  'aria-hidden': true | undefined;
}

export function resolveIconA11y(args: ResolveIconA11yInput): ResolveIconA11yOutput {
  const meaningful = typeof args.label === 'string' && args.label.length > 0;
  const explicitlyDecorative = args.decorative === true;
  const isMeaningful = meaningful && !explicitlyDecorative;

  return {
    role: isMeaningful ? 'img' : undefined,
    'aria-label': isMeaningful ? args.label : undefined,
    'aria-hidden': isMeaningful ? undefined : true,
  };
}
