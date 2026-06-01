/**
 * Convert a PascalCase or camelCase identifier to kebab-case. Used to derive URL slugs from
 * component directory names so `Button` ↔ `button` and `DropdownMenu` ↔ `dropdown-menu`.
 */
export function toKebab(input: string): string {
  return input
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/**
 * Inverse of {@link toKebab} used only when we need to find a directory from a slug. We assume the
 * canonical filesystem name is PascalCase.
 */
export function fromKebab(slug: string): string {
  return slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}