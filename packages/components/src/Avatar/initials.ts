/**
 * Distil a display name into 1–2 character initials suitable for the fallback avatar tile.
 *
 * Rules, in order:
 *   1. Empty / undefined input → empty string. Callers decide whether to render the icon fallback.
 *   2. Strings that already look like an overflow marker ("+3", "+12") pass through verbatim so
 *      `<AvatarGroup>` can reuse `<Avatar>` for the "+N" tile without a parallel render path.
 *   3. Split on whitespace; trim empty chunks. If only one chunk remains, take its first char.
 *      If multiple chunks remain, take the first char of the first chunk + the first char of the
 *      *last* chunk (handles "Ada Lovelace" → "AL" and "Mary Anne Smith" → "MS").
 *   4. Uppercase the result. For non-Latin scripts (Arabic, Hebrew, Han, …) `toUpperCase` is a
 *      safe no-op; the first character still reads correctly because we never split codepoints.
 *
 * The function is **pure** — no React, no DOM — so the test suite covers it in isolation.
 */
export function getInitials(name: string | undefined): string {
  if (!name) return '';

  const trimmed = name.trim();
  if (!trimmed) return '';

  // Pass-through for AvatarGroup overflow tiles ("+3", "+12", …). Detected literally so it doesn't
  // collide with a real name that happens to start with a "+".
  if (/^\+\d+$/.test(trimmed)) return trimmed;

  const parts = trimmed.split(/\s+/u).filter(Boolean);
  if (parts.length === 0) return '';

  const first = firstGrapheme(parts[0]!);
  if (parts.length === 1) return first.toUpperCase();

  const last = firstGrapheme(parts[parts.length - 1]!);
  return (first + last).toUpperCase();
}

/**
 * First user-perceived character. We use `Array.from` rather than indexing because surrogate
 * pairs (emoji, some Han/Hangul codepoints) live in two `string[i]` slots and would render as a
 * broken half-glyph if we used `name[0]`.
 */
function firstGrapheme(value: string): string {
  return Array.from(value)[0] ?? '';
}