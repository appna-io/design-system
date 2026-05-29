'use client';

import {
  deriveColorRole,
  useMode,
  useTheme,
  useThemeOverrides,
  type ColorRole,
  type ColorRoleName,
} from 'apx-ds';
import { RotateCcw } from 'lucide-react';

const ROLES: ColorRoleName[] = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

const DERIVED_SLOT_LABELS: Array<[keyof ColorRole, string]> = [
  ['hover', 'Hover'],
  ['active', 'Active'],
  ['contrast', 'Contrast'],
  ['subtle', 'Subtle'],
  ['border', 'Border'],
];

/**
 * Edits the active mode's palette. Each role exposes a single color input for `main`; the
 * derived slots (hover / active / contrast / subtle / border) are auto-filled by
 * `deriveColorRole()` and displayed as read-only previews so designers can sanity-check the
 * computed values before they ship the look.
 */
export function PaletteEditor() {
  const { theme } = useTheme();
  const { resolvedMode } = useMode();
  const { patchOverrides, setOverrides, overrides } = useThemeOverrides();
  const palette = theme.palette[resolvedMode];

  const handleChange = (role: ColorRoleName, nextMain: string) => {
    const derived = deriveColorRole(nextMain);
    patchOverrides({
      palette: {
        [resolvedMode]: {
          [role]: derived,
        },
      },
    });
  };

  /**
   * Resetting a single role can't be expressed as a patch (patch only adds/changes — it can't
   * delete), so we rebuild the override object without that leaf and replace wholesale.
   */
  const handleResetRole = (role: ColorRoleName) => {
    const next = stripRoleOverride(overrides, resolvedMode, role);
    setOverrides(next);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-fg-muted">
        Editing <span className="font-semibold text-fg">{resolvedMode}</span> mode. Pick a{' '}
        <code className="font-mono">main</code> color; the rest of the role is derived via the
        engine&apos;s <code className="font-mono">deriveColorRole()</code>.
      </p>

      <ul className="space-y-2">
        {ROLES.map((role) => {
          const value = palette[role];
          const main = value.main;
          const isOverridden = Boolean(overrides.palette?.[resolvedMode]?.[role]);

          return (
            <li
              key={role}
              className="rounded-md border border-border bg-bg-paper px-3 py-2.5 text-xs"
            >
              <div className="flex items-center gap-3">
                <label className="relative inline-flex h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-md border border-border">
                  <span
                    className="absolute inset-0"
                    style={{ backgroundColor: main }}
                    aria-hidden
                  />
                  <input
                    type="color"
                    value={normalizeForInput(main)}
                    onChange={(e) => handleChange(role, e.target.value)}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    aria-label={`${role} main color`}
                  />
                </label>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium capitalize text-fg">{role}</span>
                    <span className="font-mono text-fg-muted">{main}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    {DERIVED_SLOT_LABELS.map(([slot, label]) => (
                      <span
                        key={slot}
                        title={`${label} — ${value[slot]}`}
                        className="block h-4 w-4 rounded-sm border border-border"
                        style={{ backgroundColor: value[slot] }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleResetRole(role)}
                  disabled={!isOverridden}
                  className="inline-flex h-7 w-7 items-center justify-center rounded text-fg-muted transition hover:text-fg disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label={`Reset ${role}`}
                  title={isOverridden ? `Reset ${role}` : `${role} is at DS default`}
                >
                  <RotateCcw size={13} aria-hidden />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** Native `<input type="color">` requires a 6-digit hex. Names / CSS vars are coerced to white. */
function normalizeForInput(value: string): string {
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    const v = value.slice(1);
    return `#${v[0]}${v[0]}${v[1]}${v[1]}${v[2]}${v[2]}`;
  }
  return '#ffffff';
}

/**
 * Build a new override object identical to `current`, except the leaf at
 * `palette.<mode>.<role>` is removed. If that removal empties out a parent object, prune it too.
 */
function stripRoleOverride(
  current: unknown,
  mode: 'light' | 'dark',
  role: ColorRoleName,
): Record<string, unknown> {
  const c = (current ?? {}) as {
    palette?: { light?: Record<string, unknown>; dark?: Record<string, unknown> };
  };
  if (!c.palette || !c.palette[mode]) return { ...c };
  const modePalette = { ...c.palette[mode] };
  delete modePalette[role];
  const palette = { ...c.palette };
  if (Object.keys(modePalette).length === 0) {
    delete palette[mode];
  } else {
    palette[mode] = modePalette;
  }
  const next: Record<string, unknown> = { ...c };
  if (Object.keys(palette).length === 0) {
    delete next.palette;
  } else {
    next.palette = palette;
  }
  return next;
}
