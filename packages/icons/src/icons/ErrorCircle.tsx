import { createIcon } from '../createIcon';

/**
 * Named `ErrorCircle` (not `Error`) so the export doesn't shadow JavaScript's
 * built-in `Error` constructor when consumers do `import * as Icons` or
 * `const { Error } = await import(...)`.
 */
export const ErrorCircle = createIcon(
  'ErrorCircle',
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </>,
);