'use client';

import { useEffect, useRef } from 'react';

import { commands, type Command, type CommandContext } from './commandStore';

/**
 * Hook-based command registration. Register on mount, unregister on unmount.
 *
 * The command identity (everything except `onSelect`) is captured in a ref so a parent that
 * re-renders doesn't churn the store. `onSelect` is also ref'd so the handler always sees the
 * latest closure values without re-registering.
 *
 * If `command` is `null` / `false` (allowed for conditional registration), nothing is
 * registered — useful for `useRegisterCommand(canEdit && { id: 'edit', … })`.
 */
export function useRegisterCommand(command: Command | null | false | undefined): void {
  const onSelectRef = useRef<(ctx: CommandContext) => void | Promise<void>>(() => undefined);
  useEffect(() => {
    onSelectRef.current = command ? command.onSelect : () => undefined;
  }, [command]);

  // Serialize the static identity so the effect only re-fires when the command meaningfully
  // changes. We use a JSON-serialized fingerprint of the static fields (id, label, shortcut,
  // category, keywords, disabled) plus the `icon` / `description` / `when` references — those
  // can't be JSON-encoded but their identity changes are a fine proxy for "this command is
  // different now".
  // Narrow the value once so type guards flow into the effect.
  const cmd: Command | null = command || null;
  const fingerprint = cmd
    ? `${cmd.id}|${cmd.label}|${cmd.shortcut ?? ''}|${cmd.category ?? ''}|${(cmd.keywords ?? []).join(',')}|${cmd.disabled ? '1' : '0'}`
    : null;

  useEffect(() => {
    if (!cmd) return;
    const unregister = commands.register({
      ...cmd,
      // Stable wrapper that defers to the latest `onSelect` ref.
      onSelect: (ctx) => onSelectRef.current(ctx),
    });
    return unregister;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fingerprint, cmd?.icon, cmd?.description, cmd?.when]);
}
