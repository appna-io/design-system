'use client';

import { useId } from '@apx-ui/engine';
import { useMemo } from 'react';

export interface UseFieldIdsOptions {
  /** Consumer-provided id for the inner form control. Generated when omitted. */
  htmlFor?: string | undefined;
}

export interface UseFieldIdsReturn {
  /** Stable id assigned to the inner form control. */
  controlId: string;
  /** Stable id for the description paragraph (only attached when description renders). */
  descriptionId: string;
  /** Stable id for the helper paragraph (only attached when helper renders). */
  helperId: string;
  /** Stable id for the error paragraph (only attached when error renders). */
  errorId: string;
}

/**
 * Single source of truth for the four ids `<Field>` needs to wire `<label htmlFor>` +
 * `aria-describedby` + `aria-errormessage` correctly. Pulled into its own hook so the root and
 * any future Field-aware tooling (e.g. Form validation summaries) can derive identical ids from
 * the same inputs.
 *
 * Mirrors the SSR-safe pattern shared across the design system: `useId` from `@apx-ui/engine`
 * wraps React's `useId` so generated ids are stable across hydration.
 */
export function useFieldIds(options: UseFieldIdsOptions = {}): UseFieldIdsReturn {
  const controlId = useId(options.htmlFor);
  const descriptionId = useId();
  const helperId = useId();
  const errorId = useId();

  return useMemo<UseFieldIdsReturn>(
    () => ({ controlId, descriptionId, helperId, errorId }),
    [controlId, descriptionId, helperId, errorId],
  );
}