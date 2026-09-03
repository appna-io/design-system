/**
 * The token contract: **a design token that resolves to nothing must not ship.**
 *
 * Four separate bugs in this codebase were the same bug, and each one was found by eye, late:
 *
 *   - `NavigationMenu` / `Sidebar` / `AppShell` / `Toolbar` styled against `--sds-color-*`, which
 *     nothing has ever emitted. Four components with no surface or border colors.
 *   - `DataGrid` styled against bare role names (`--sds-primary`, `--sds-focus`). No accent bar on
 *     any selected row, and no visible keyboard focus ring on grid cells.
 *   - The Tailwind preset had no `fontFamily` mapping, so `typography.fontFamily.mono` was inert.
 *   - The renderer's `<Inspectable>` painted with `--sds-palette-primary`, a role with no slot.
 *   - `<Typography color="fg.muted">` — the **runtime prop resolver** rejected the `fg.` spelling
 *     the DS teaches everywhere else, so 502 declarations across this repo rendered at the
 *     inherited colour. The first two checks below could not see it: it is neither a class nor a
 *     `var()` written in source, which is exactly why the third one exists.
 *
 * They share a failure mode that makes them uniquely hard to notice: an undefined custom property
 * is invalid *at computed-value time*, so the browser drops the whole declaration. There is no
 * console warning, no red squiggle, no broken-looking value in devtools — the style is simply
 * absent. `background-color` falls back to `transparent` and `color` to whatever it inherits, so
 * the page still looks *plausible*. A test is the only place this can be caught cheaply.
 *
 * So: rather than grep for the fifth instance, assert the contract.
 *
 *   1. Every `var(--sds-…)` written in source is a variable `themeToCssVars` actually emits.
 *   2. Every DS color utility class names a scale slot the Tailwind preset actually defines.
 *   3. Every palette value handed to a colour *prop* resolves, through the real `sxToStyle`, to a
 *      variable `themeToCssVars` actually emits.
 *
 * Both read the real generators rather than a hardcoded list, so adding a token or a slot updates
 * the expectation automatically and only genuine mismatches fail.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { sxToStyle } from '@apx-ui/engine';
import { apxTailwindPreset, defineTheme, themeToCssVars } from '@apx-ui/theme';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..', 'src');

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...sourceFiles(full));
    else if (/\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/** Source lines that are part of a block/line comment — prose about tokens, not uses of them. */
function codeLines(source: string): string[] {
  return source.split('\n').filter((line) => {
    const t = line.trimStart();
    return !t.startsWith('*') && !t.startsWith('//') && !t.startsWith('/*');
  });
}

const FILES = sourceFiles(SRC);


describe('token contract — every --sds-* var referenced is a var that gets emitted', () => {
  it('has no reference to a variable the theme never defines', () => {
    const emitted = new Set(themeToCssVars(defineTheme()).match(/--sds-[a-z0-9-]+(?=\s*:)/g) ?? []);
    expect(emitted.size).toBeGreaterThan(50);

    const offenders: string[] = [];

    for (const file of FILES) {
      for (const line of codeLines(readFileSync(file, 'utf8'))) {
        for (const match of line.matchAll(/var\(\s*(--sds-[a-zA-Z0-9-]*)\s*([,)])/g)) {
          const name = match[1]!;
          const terminator = match[2]!;

          // `var(--x, fallback)` is explicitly defensive — the author said what happens when the
          // variable is absent, which is the opposite of this bug. Skeleton's consumer-overridable
          // tokens and the optional display face both live here legitimately.
          if (terminator === ',') continue;

          // Built by interpolation (`var(--sds-palette-${role}-main)`); the literal prefix that
          // survives the regex is not a real variable name.
          if (/var\(\s*--sds-[a-zA-Z0-9-]*\$\{/.test(line)) continue;
          if (name.endsWith('-')) continue;

          if (!emitted.has(name)) {
            offenders.push(`${relative(SRC, file)}: ${name}`);
          }
        }
      }
    }

    expect([...new Set(offenders)].sort()).toEqual([]);
  });
});

describe('token contract — every DS color class names a slot the preset defines', () => {
  it('has no color utility pointing at a nonexistent scale slot', () => {
    const colors = apxTailwindPreset.theme.extend.colors as Record<
      string,
      string | Record<string, string>
    >;

    const slotsByScale = new Map<string, Set<string>>();
    for (const [scale, value] of Object.entries(colors)) {
      // Scalars (`overlay`) have no slots — `bg-overlay-foo` is not a thing anyone writes, and
      // treating them as scales would flag every unrelated `bg-overlay` usage.
      if (typeof value === 'object') slotsByScale.set(scale, new Set(Object.keys(value)));
    }
    expect(slotsByScale.size).toBeGreaterThan(5);

    const props = [
      'bg',
      'text',
      'border',
      'ring',
      'from',
      'via',
      'to',
      'fill',
      'stroke',
      'decoration',
      'outline',
      'divide',
      'accent',
      'caret',
      'placeholder',
      'shadow',
    ].join('|');
    // Optional Tailwind variant prefixes (`hover:`, `[&>td]:`, `focus-visible:`) then
    // `<prop>-<scale>-<slot>` with an optional `/opacity`. A bare `<prop>-<scale>` is the
    // scale's DEFAULT and always valid, so `slot` is required for a match to be interesting.
    // The slot is `[a-zA-Z]+`, not `[a-z]+`: the first version of this guard used lower-case
    // only and so walked straight past `text-fg-onPrimary`, which was dead in four files.
    const pattern = new RegExp(
      String.raw`(?<![\w-])(?:[\w\[\]&>:.*()#="'-]+:)*(${props})-([a-zA-Z]+)-([a-zA-Z]+)(?:\/\d+)?(?![\w-])`,
      'g',
    );

    const offenders: string[] = [];

    for (const file of FILES) {
      for (const line of codeLines(readFileSync(file, 'utf8'))) {
        for (const match of line.matchAll(pattern)) {
          const scale = match[2]!;
          const slot = match[3]!;
          const slots = slotsByScale.get(scale);
          if (!slots) continue; // not a DS color scale — `text-sm`, `bg-white`, `border-2`, …
          if (!slots.has(slot)) {
            offenders.push(`${relative(SRC, file)}: ${scale}-${slot}`);
          }
        }
      }
    }

    expect([...new Set(offenders)].sort()).toEqual([]);
  });
});

describe('token contract — every colour prop resolves to a variable that exists', () => {
  it('has no colour prop whose value resolves to nothing', () => {
    const emitted = new Set(themeToCssVars(defineTheme()).match(/--sds-[a-z0-9-]+(?=\s*:)/g) ?? []);

    // Only components that route these props through `sxToStyle`. `color` on Button / Badge /
    // Alert / Progress / Checkbox is a RECIPE VARIANT — `<Button color="primary">` is correct and
    // must not be flagged. Conflating the two is the easy way to "fix" something that isn't broken.
    const SX_ROUTED = ['Div', 'Typography', 'Text', 'Stack', 'HStack', 'VStack', 'Surface'];
    const openTag = new RegExp(`<(${SX_ROUTED.join('|')})\\b([^>]*?)/?>`, 'gs');
    const colourProp =
      /\b(color|bg|fg|backgroundColor|borderColor)=(?:"([^"]+)"|\{\s*['"]([^'"]+)['"]\s*\})/g;

    const offenders: string[] = [];

    for (const file of FILES) {
      // Same comment filter as the other two checks — a doc comment showing `bg="primary.50"`
      // is prose, not a call site. (It should still be corrected; it just isn't a defect here.)
      const src = codeLines(readFileSync(file, 'utf8')).join('\n');
      for (const tag of src.matchAll(openTag)) {
        for (const m of (tag[2] ?? '').matchAll(colourProp)) {
          const prop = m[1]!;
          const value = (m[2] ?? m[3])!;
          if (/^(var\(|#|rgb|hsl)/.test(value)) continue;
          // Real CSS keywords, not palette paths.
          if (['inherit', 'currentColor', 'transparent', 'unset', 'initial'].includes(value)) {
            continue;
          }

          // Run the ACTUAL resolver — no second implementation to drift from it.
          const resolved = Object.values(sxToStyle({ [prop]: value }))[0];
          if (typeof resolved !== 'string') continue;

          const varName = /^var\((--sds-[a-z0-9-]+)\)$/.exec(resolved)?.[1];
          if (!varName) {
            // Didn't resolve at all — the value passes through as literal CSS and is dropped.
            offenders.push(`${relative(SRC, file)}: ${prop}="${value}" (unresolved)`);
          } else if (!emitted.has(varName)) {
            offenders.push(`${relative(SRC, file)}: ${prop}="${value}" -> ${varName} (not emitted)`);
          }
        }
      }
    }

    expect([...new Set(offenders)].sort()).toEqual([]);
  });
});
