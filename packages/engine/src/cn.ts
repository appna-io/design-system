import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Compose conditional class strings and resolve Tailwind conflicts. This is the **only** class
 * composition helper components should reach for — never use `clsx` or `tailwind-merge` directly.
 *
 * Semantics:
 *  - Accepts the same inputs as `clsx` (strings, arrays, objects, falsy values).
 *  - Later classes win over earlier ones for conflicting Tailwind utilities (`p-4` then `p-2`
 *    resolves to `p-2`).
 *  - Empty inputs return an empty string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export type { ClassValue };