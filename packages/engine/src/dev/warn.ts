declare const process:
  | {
      env?: { NODE_ENV?: string };
    }
  | undefined;

const seen = new Set<string>();

function isProduction(): boolean {
  try {
    return typeof process !== 'undefined' && process?.env?.NODE_ENV === 'production';
  } catch {
    return false;
  }
}

/**
 * Emit a console warning when `condition` is **falsy**. No-ops in production. Each unique message
 * is logged at most once per session to avoid flooding the console.
 *
 * @example
 *   warn(Boolean(label), 'Button: icon-only buttons require an `aria-label`.', 'SDS-001');
 */
export function warn(condition: unknown, message: string, code?: string): void {
  if (condition) return;
  if (isProduction()) return;

  const fullMessage = code ? `[apx-ds][${code}] ${message}` : `[apx-ds] ${message}`;
  if (seen.has(fullMessage)) return;
  seen.add(fullMessage);

  // eslint-disable-next-line no-console
  console.warn(fullMessage);
}

/** Test-only helper to reset the dedupe set. Not exported from the package's public surface. */
export function __resetWarnCache(): void {
  seen.clear();
}
