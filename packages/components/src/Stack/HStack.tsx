'use client';

import { forwardRef } from '@apx-ui/engine';

import { Stack } from './Stack';
import type { HVStackProps } from './Stack.types';

/**
 * `<HStack>` — semantic alias for `<Stack direction="row">`. Same prop surface as `Stack` minus
 * `direction` (which is locked). Reads cleaner at the call site than `<Stack direction="row">`
 * and matches the Chakra / Polaris convention developers already know.
 *
 * @example
 *   <HStack gap={2} align="center">
 *     <Avatar src={user.avatar} />
 *     <span>{user.name}</span>
 *   </HStack>
 */
export const HStack = forwardRef<HTMLElement, HVStackProps>(function HStack(props, ref) {
  return <Stack ref={ref} {...props} direction="row" />;
}, 'HStack');
