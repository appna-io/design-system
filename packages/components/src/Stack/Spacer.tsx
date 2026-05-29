'use client';

import { forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';

import { SPACER_FIXED_CLASSES, spacerRecipe } from './Stack.recipe';
import { SPACER_MARKER } from './stackChildrenWithDivider';
import type { SpacerAxis, SpacerProps, SpacerSize } from './Stack.types';

/**
 * `<Spacer>` — partner primitive that produces separation inside a Stack.
 *
 * Two modes:
 *   - **Greedy** (default): `flex: 1` — pushes its siblings to the opposite ends of the Stack.
 *   - **Fixed**: `size={n}` — fixed span on the parent's main axis (or the axis you pin via
 *     `axis="block" | "inline"`). Uses the same theme spacing scale as `gap`.
 *
 * Spacer is `aria-hidden` so screen readers ignore the layout primitive entirely. The `<Stack>`
 * divider-insertion logic detects Spacers via the `__sds_spacer = true` marker on this function
 * and skips inserting dividers adjacent to them.
 *
 * @example
 *   <HStack>
 *     <Button>Cancel</Button>
 *     <Spacer />
 *     <Button>Save</Button>
 *   </HStack>
 *
 *   <VStack>
 *     <Header />
 *     <Spacer size={6} />
 *     <Body />
 *   </VStack>
 */
export const Spacer = forwardRef<HTMLDivElement, SpacerProps>(function Spacer(props, ref) {
  const { size, axis = 'auto', className, style, sx, ...rest } = props;

  const fixed = size !== undefined;

  const { className: recipeCls, style: recipeStyle } = useThemedClasses({
    recipe: spacerRecipe,
    componentName: 'Spacer',
    props: { fixed, className, sx, style },
  });

  // When fixed, append the axis-specific size class. `axis="auto"` defaults to the inline axis
  // (the most common Stack — `HStack` — flows horizontally, so a fixed Spacer naturally pins to
  // width). `axis="block"` and `axis="inline"` give callers an explicit override.
  const fixedCls = fixed ? fixedSpacerClass(axis, size as SpacerSize) : '';
  const mergedClassName = fixedCls ? `${recipeCls} ${fixedCls}` : recipeCls;

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-sds-spacer="true"
      className={mergedClassName}
      style={recipeStyle ?? undefined}
      {...rest}
    />
  );
}, 'Spacer') as ReturnType<typeof forwardRef<HTMLDivElement, SpacerProps>> & {
  [SPACER_MARKER]: true;
};

// Marker for `stackChildrenWithDivider`. We tag the *function* (returned by `forwardRef`) so
// divider insertion can identify Spacer children across minified bundles + React.lazy.
(Spacer as unknown as { [SPACER_MARKER]: true })[SPACER_MARKER] = true;

function fixedSpacerClass(axis: SpacerAxis, size: SpacerSize): string {
  const resolvedAxis: 'block' | 'inline' = axis === 'block' ? 'block' : 'inline';
  const key = scaleKey(size);
  return SPACER_FIXED_CLASSES[resolvedAxis][key] ?? '';
}

function scaleKey(value: SpacerSize): keyof (typeof SPACER_FIXED_CLASSES)['block'] {
  if (value === 'px') return 'px';
  return String(value) as keyof (typeof SPACER_FIXED_CLASSES)['block'];
}
