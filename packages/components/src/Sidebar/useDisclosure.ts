import { useCallback } from 'react';
import { useControllableState } from '@apx-ui/engine';

/**
 * Tiny controllable disclosure hook — shared by `<Sidebar.Section collapsible>` and
 * `<Sidebar.Item expandable>` so both have identical open/closed semantics.
 *
 * Lives inside `src/Sidebar/` (not `_shared/`) per the room guardrail: extraction to engine /
 * `_shared/` requires a posted API and a third consumer. Today's consumers are both inside
 * Sidebar. When a future component (DataGrid row expanders, NavigationMenu submenus) wants the
 * same shape, this is the natural promotion target.
 *
 * Returns an `[open, setOpen, toggle]` tuple. `setOpen` accepts a boolean; `toggle` flips the
 * current value. Both call `onOpenChange` so controlled callers see every transition.
 */
export function useDisclosure(options: {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?: ((open: boolean) => void) | undefined;
}): { open: boolean; setOpen: (next: boolean) => void; toggle: () => void } {
  const [rawOpen, setOpen] = useControllableState<boolean>({
    value: options.open,
    defaultValue: options.defaultOpen ?? false,
    onChange: options.onOpenChange,
  });
  const open = rawOpen ?? false;
  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);
  return { open, setOpen, toggle };
}
