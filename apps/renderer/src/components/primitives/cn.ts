import { clsx, type ClassValue } from 'clsx';

/**
 * Local `cn` for the renderer chrome. Intentionally does NOT import `apx-ds` — we want chrome
 * to keep rendering even if the DS itself fails to compile during development. Tailwind-merge is
 * skipped here because chrome styles don't compose user-supplied DS variants.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}