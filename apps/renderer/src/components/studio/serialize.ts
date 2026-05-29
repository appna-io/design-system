import type { ThemeOverride } from '@apx-ui/ds';

/**
 * Format a JS value as a copy-pasteable TypeScript source snippet. Mirrors `JSON.stringify`'s
 * 2-space indent but emits identifier-style keys (no quotes) when possible, single-quoted
 * strings, and `undefined` is skipped — the output should look like hand-written TS, not JSON.
 */
function formatValue(value: unknown, indent: number): string {
  const pad = '  '.repeat(indent);
  const childPad = '  '.repeat(indent + 1);

  if (value === null) return 'null';
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((v) => `${childPad}${formatValue(v, indent + 1)}`).join(',\n');
    return `[\n${items},\n${pad}]`;
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v !== undefined,
    );
    if (entries.length === 0) return '{}';
    const lines = entries.map(([k, v]) => {
      const key = /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : `'${k}'`;
      return `${childPad}${key}: ${formatValue(v, indent + 1)}`;
    });
    return `{\n${lines.join(',\n')},\n${pad}}`;
  }

  return String(value);
}

/**
 * Render the current override object as a `defineTheme({ … })` source snippet that a consumer
 * can paste into their own app to lock in the look they just designed in the Studio.
 *
 * Empty overrides produce a no-op snippet — useful so the modal still has *something* to copy.
 */
export function serializeOverridesToTs(overrides: ThemeOverride): string {
  const body = formatValue(overrides, 0);
  return `import { defineTheme } from '@apx-ui/ds';

export const myTheme = defineTheme(${body});`;
}
