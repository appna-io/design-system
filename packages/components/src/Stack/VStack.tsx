'use client';

import { forwardRef } from '@apx-ui/engine';

import { Stack } from './Stack';
import type { HVStackProps } from './Stack.types';

/**
 * `<VStack>` — semantic alias for `<Stack direction="column">`. Same prop surface as `Stack`
 * minus `direction` (which is locked). Stack's *default* is also `column`, so `<VStack>` reads
 * as a deliberate "this is a vertical stack" rather than relying on the default.
 *
 * @example
 *   <VStack gap={4}>
 *     <Card>Project Apollo</Card>
 *     <Card>Project Mercury</Card>
 *   </VStack>
 */
export const VStack = forwardRef<HTMLElement, HVStackProps>(function VStack(props, ref) {
  return <Stack ref={ref} {...props} direction="column" />;
}, 'VStack');
