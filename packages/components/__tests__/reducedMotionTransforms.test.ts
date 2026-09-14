import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * The one reduced-motion gap nothing else in the repo covers.
 *
 * `reset.css` cancels motion globally under `prefers-reduced-motion` by zeroing
 * `animation-duration` and `transition-duration` with `!important`. That handles animations and
 * transitions — but it cannot touch a **transform**, which applies whether or not anything eases
 * it. A bare `hover:scale-110` under reduced motion still scales to 110%; it just snaps there.
 *
 * That is a real bug we shipped (`ColorPicker`'s preset swatch), and it looked handled: the line
 * carried `motion-reduce:transition-none`, which suppressed the easing and left the growth.
 *
 * It is also not covered by:
 *  - the reduced-motion Playwright suite, which reads durations and animation state;
 *  - `future.hoverOnlyWhenSupported`, which is about touch, not motion preference;
 *  - the reset, per the above.
 *
 * So this is a source-level scan: any state-triggered transform must be gated with `motion-safe:`
 * or explicitly undone. It reads the recipe files rather than rendered output because that is
 * where the class is chosen, and because catching it at author time is the point.
 */

const RECIPES_ROOT = join(__dirname, '..', 'src');

/** Transform utilities that visibly move an element. `rotate`/`skew` included for completeness. */
const TRANSFORM = String.raw`(?:-?(?:scale|translate-[xy]|translate|rotate|skew-[xy])-)`;

/**
 * A state-triggered transform: some interaction variant, then a transform utility.
 *
 * `hover:` / `group-hover:` / `active:` / `focus:` only — a transform under `data-[state=open]:`
 * is an open/closed position rather than motion for its own sake, and cancelling it would move
 * the element to the wrong place.
 */
const RISKY = new RegExp(
  String.raw`(?<![\w:-])(?:group-)?(?:hover|active|focus|focus-visible)(?:\/[\w-]+)?:${TRANSFORM}`,
);

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      if (entry === 'examples' || entry === '__tests__') continue;
      out.push(...sourceFiles(full));
    } else if (/\.(ts|tsx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

interface Finding {
  file: string;
  line: number;
  text: string;
}

function findUngatedTransforms(): Finding[] {
  const findings: Finding[] = [];

  for (const file of sourceFiles(RECIPES_ROOT)) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((raw, i) => {
      // Only class strings, and skip comment lines — a rule quoted in a docblock isn't shipped.
      const trimmed = raw.trim();
      if (trimmed.startsWith('*') || trimmed.startsWith('//')) return;

      for (const match of raw.matchAll(new RegExp(RISKY, 'g'))) {
        const at = match.index ?? 0;
        const before = raw.slice(Math.max(0, at - 24), at);

        // Gated if `motion-safe:` immediately precedes the variant chain…
        if (/motion-safe:$/.test(before)) continue;
        // …or if the same line carries a matching `motion-reduce:` undo.
        if (/motion-reduce:/.test(raw)) continue;

        findings.push({
          file: file.replace(`${RECIPES_ROOT}/`, ''),
          line: i + 1,
          text: match[0],
        });
      }
    });
  }

  return findings;
}

describe('reduced motion — state-triggered transforms', () => {
  it('every hover/active/focus transform is gated on motion-safe (or explicitly undone)', () => {
    const findings = findUngatedTransforms();

    const report = findings
      .map((f) => `  ${f.file}:${f.line}  ${f.text}`)
      .join('\n');

    expect(
      findings,
      findings.length === 0
        ? ''
        : `Ungated state-triggered transform(s):\n${report}\n\n` +
          `reset.css cancels motion by zeroing animation/transition DURATION — it cannot cancel a ` +
          `transform, which applies instantly with no easing. Prefix with 'motion-safe:'.`,
    ).toEqual([]);
  });

  it('the scan actually finds things — it is not matching nothing', () => {
    // A scan that silently matches zero patterns passes forever. This pins that the regex still
    // recognises the shape it is looking for, independent of whether the codebase currently has
    // any violations.
    expect(RISKY.test('hover:scale-110')).toBe(true);
    expect(RISKY.test('group-hover/image:scale-[1.04]')).toBe(true);
    expect(RISKY.test('active:-translate-y-1')).toBe(true);

    // …and that it does not fire on the gated or irrelevant forms.
    expect(RISKY.test('data-[state=open]:rotate-180')).toBe(false);
    expect(RISKY.test('scale-110')).toBe(false);
  });
});
