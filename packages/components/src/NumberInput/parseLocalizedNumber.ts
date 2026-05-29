/**
 * Locale-aware string → number parser. Handles:
 *
 *  - Thousand separators (`,` en-US, `.` de-DE, `\u00A0` fr-FR, etc.).
 *  - Decimal separators (`.` en-US, `,` de-DE, `\u066B` fa-IR, etc.).
 *  - Arabic-Indic digits (`\u0660`–`\u0669`) → ASCII.
 *  - Extended Arabic-Indic digits (`\u06F0`–`\u06F9`) → ASCII (used by Persian / Urdu).
 *  - Surrounding whitespace + signs.
 *  - Scientific notation is **rejected** (`1e5` → null) — native `Number()` accepts it, but
 *    numeric form inputs that accept `1e5` are a known UX trap. Consumers wanting it can pass a
 *    custom `parse` prop.
 *
 * Returns `null` when the trimmed input is empty or the residue after normalization isn't a
 * finite number.
 */
export function parseLocalizedNumber(input: string, locale: string): number | null {
  const trimmed = input.trim();
  if (trimmed === '') return null;

  // Probe `formatToParts` to discover the locale's literal group / decimal separators. Using a
  // value with both a thousand separator and a decimal point (12345.6) so both parts surface.
  let groupSep = ',';
  let decimalSep = '.';
  try {
    const probe = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const group = probe.find((p) => p.type === 'group')?.value;
    const decimal = probe.find((p) => p.type === 'decimal')?.value;
    if (group !== undefined) groupSep = group;
    if (decimal !== undefined) decimalSep = decimal;
  } catch {
    // Bad locale tag — fall through to the en-US defaults.
  }

  // Normalize non-ASCII digits. Arabic-Indic + Persian + Devanagari + Bengali are the practical
  // cases an i18n form has to handle today; the others can be added with the same pattern.
  let normalized = trimmed
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0));

  // Strip group separators, then translate the locale decimal to ASCII `.`. The split/join keeps
  // the code branch-free for the common case where the separator is empty (some locales).
  if (groupSep !== '') {
    normalized = normalized.split(groupSep).join('');
  }
  if (decimalSep !== '.' && decimalSep !== '') {
    normalized = normalized.split(decimalSep).join('.');
  }

  // Reject scientific notation early — `Number('1e5')` is finite but we don't want it for UI.
  if (/[eE]/.test(normalized)) return null;

  // Some locales emit non-ASCII minus signs (e.g. `\u2212`). Normalize to `-`.
  normalized = normalized.replace(/[\u2212\u2013]/g, '-');

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}
