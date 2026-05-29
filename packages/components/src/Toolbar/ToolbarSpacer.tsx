'use client';

import { forwardRef } from '@apx-ui/engine';

import { Spacer } from '../Stack/Spacer';
import type { ToolbarSpacerProps } from './Toolbar.types';

/**
 * Pushes following toolbar items to the logical end. This is a thin wrapper over the shipped
 * `<Spacer>` from the Stack family — it inherits Spacer's behavior (greedy `flex: 1` when no
 * size is supplied, fixed `w-*` when `size` is set) and adds:
 *
 *   - `data-toolbar-skip="true"` so the toolbar's roving-tabindex pass ignores it.
 *   - `data-toolbar-spacer=""` for consumer-level styling hooks.
 *
 * No context consumption — Spacer is direction-agnostic by virtue of `flex: 1` and `self-stretch`.
 */
export const ToolbarSpacer = forwardRef<HTMLDivElement, ToolbarSpacerProps>(
  function ToolbarSpacer(props, ref) {
    const { size, className, style, sx, ...rest } = props as ToolbarSpacerProps & Record<string, unknown>;
    return (
      <Spacer
        ref={ref}
        {...(size !== undefined ? { size } : {})}
        data-toolbar-skip="true"
        data-toolbar-spacer=""
        {...(className !== undefined ? { className } : {})}
        {...(style !== undefined ? { style } : {})}
        {...(sx !== undefined ? { sx } : {})}
        {...rest}
      />
    );
  },
  'Toolbar.Spacer',
);
