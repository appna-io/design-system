/**
 * Permissive `format`-token parser + formatter. Used by `<DatePicker>` for the typed input.
 *
 * Implements a Unicode TR 35 subset:
 *
 * | Token   | Meaning                       | Example       |
 * | ------- | ----------------------------- | ------------- |
 * | `yyyy`  | 4-digit year                  | 2026          |
 * | `yy`    | 2-digit year (pivot ±50)      | 26 → 2026     |
 * | `MMMM`  | Locale full month name        | January       |
 * | `MMM`   | Locale short month name       | Jan           |
 * | `MM`    | 2-digit month                 | 01            |
 * | `M`     | 1- or 2-digit month           | 1             |
 * | `dd`    | 2-digit day                   | 05            |
 * | `d`     | 1- or 2-digit day             | 5             |
 *
 * The parser is **permissive on separators**: a value typed with `-` parses against a
 * `MM/dd/yyyy` pattern. Whitespace between fields is collapsed. Two-digit years are pivoted
 * around the current year (±50 → 2026 ⇄ 26 ↔ 1976–2076).
 */

const TOKEN_RE = /(yyyy|yy|MMMM|MMM|MM|M|dd|d)/g;
/** Anything that isn't an alphanumeric token in the format string is a separator. */
const SEPARATOR_RE = /[^A-Za-z0-9]+/;

interface ParsedToken {
  /** Either a token like `'yyyy'` or a literal separator like `'/'`. */
  value: string;
  isToken: boolean;
}

/** Split a format string into a sequence of tokens + literal separators. */
function tokenize(format: string): ParsedToken[] {
  const tokens: ParsedToken[] = [];
  let lastEnd = 0;
  for (const match of format.matchAll(TOKEN_RE)) {
    const start = match.index ?? 0;
    if (start > lastEnd) {
      tokens.push({ value: format.slice(lastEnd, start), isToken: false });
    }
    tokens.push({ value: match[0], isToken: true });
    lastEnd = start + match[0].length;
  }
  if (lastEnd < format.length) {
    tokens.push({ value: format.slice(lastEnd), isToken: false });
  }
  return tokens;
}

/** Convert a locale month name (`January` / `Jan`) back into a 0-based month index. */
function parseMonthName(s: string, locale: string): number | null {
  const longFmt = new Intl.DateTimeFormat(locale, { month: 'long' });
  const shortFmt = new Intl.DateTimeFormat(locale, { month: 'short' });
  const needle = s.toLocaleLowerCase(locale);
  for (let m = 0; m < 12; m++) {
    const ref = new Date(2000, m, 1);
    if (longFmt.format(ref).toLocaleLowerCase(locale) === needle) return m;
    if (shortFmt.format(ref).toLocaleLowerCase(locale) === needle) return m;
  }
  return null;
}

/** Pivot 2-digit year to 4-digit. Window = current year ±50. */
function expandTwoDigitYear(yy: number, now = new Date()): number {
  const currentYear = now.getFullYear();
  const century = Math.floor(currentYear / 100) * 100;
  const pivot = currentYear - 50;
  const candidate = century + yy;
  if (candidate < pivot) return candidate + 100;
  if (candidate > pivot + 99) return candidate - 100;
  return candidate;
}

/**
 * Parse `input` against `format` (e.g. `'MM/dd/yyyy'`). Returns `null` on any failure.
 *
 * Separator-permissive: the format's literal separators are treated as a "this is where one
 * field ends" hint, not a strict match.
 */
export function parseDateFormat(
  input: string,
  format: string,
  locale: string = 'en-US',
): Date | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const tokens = tokenize(format).filter((tok) => tok.isToken);
  // Split the input on any run of non-alphanumerics. We support locales whose month names
  // contain spaces by stitching trailing fragments together for `MMMM` tokens.
  const fragments = trimmed.split(SEPARATOR_RE).filter(Boolean);
  if (fragments.length === 0) return null;

  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;
  let cursor = 0;

  for (const tok of tokens) {
    const frag = fragments[cursor];
    if (frag === undefined) return null;

    switch (tok.value) {
      case 'yyyy': {
        if (!/^\d{4}$/.test(frag)) return null;
        year = Number(frag);
        break;
      }
      case 'yy': {
        if (!/^\d{1,2}$/.test(frag)) return null;
        year = expandTwoDigitYear(Number(frag));
        break;
      }
      case 'MM':
      case 'M': {
        if (!/^\d{1,2}$/.test(frag)) return null;
        const n = Number(frag);
        if (n < 1 || n > 12) return null;
        month = n - 1;
        break;
      }
      case 'MMM':
      case 'MMMM': {
        const parsed = parseMonthName(frag, locale);
        if (parsed === null) return null;
        month = parsed;
        break;
      }
      case 'dd':
      case 'd': {
        if (!/^\d{1,2}$/.test(frag)) return null;
        const n = Number(frag);
        if (n < 1 || n > 31) return null;
        day = n;
        break;
      }
      default:
        return null;
    }
    cursor += 1;
  }

  if (year === null || month === null || day === null) return null;

  const date = new Date(year, month, day, 0, 0, 0, 0);
  // Reject overflow (Feb 31 → Mar 3).
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return null;
  }
  return date;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Format a Date using the same Unicode TR 35 subset the parser accepts. */
export function formatDate(date: Date, format: string, locale: string = 'en-US'): string {
  const tokens = tokenize(format);
  const longMonth = new Intl.DateTimeFormat(locale, { month: 'long' });
  const shortMonth = new Intl.DateTimeFormat(locale, { month: 'short' });
  return tokens
    .map((tok) => {
      if (!tok.isToken) return tok.value;
      switch (tok.value) {
        case 'yyyy':
          return String(date.getFullYear());
        case 'yy':
          return pad2(date.getFullYear() % 100);
        case 'MMMM':
          return longMonth.format(date);
        case 'MMM':
          return shortMonth.format(date);
        case 'MM':
          return pad2(date.getMonth() + 1);
        case 'M':
          return String(date.getMonth() + 1);
        case 'dd':
          return pad2(date.getDate());
        case 'd':
          return String(date.getDate());
        default:
          return tok.value;
      }
    })
    .join('');
}