import { token } from '@apx-ui/engine';

/**
 * Gradient anchor / direction. For **radial** gradients this is the origin
 * point (`at X% Y%`). For **linear** gradients it's the destination edge
 * (`to top right`).
 */
export type DivGradientPosition =
  | 'top'
  | 'top-left'
  | 'top-right'
  | 'right'
  | 'bottom'
  | 'bottom-right'
  | 'bottom-left'
  | 'left'
  | 'center';

export type DivGradientType = 'radial' | 'linear';

/**
 * Structured shape for the `<Div gradient={…} />` prop. Every field is optional —
 * defaults track the DS's primary palette so a bare `<Div gradient />` produces a
 * sensible theme-aware backdrop.
 */
export interface DivGradientConfig {
  /** `'radial'` (default) or `'linear'`. */
  type?: DivGradientType | undefined;
  /**
   * Starting color. Accepts a palette token path (`'primary.subtle'`, `'success.main'`)
   * or any raw CSS color (`'#abc'`, `'rgba(0,0,0,.5)'`, `'var(--my-var)'`). Default:
   * `'primary.subtle'` — tracks the active theme variant via the same CSS variables
   * the rest of the DS uses.
   */
  from?: string | undefined;
  /**
   * Ending color. Same value rules as `from`. Default: `'transparent'` so the
   * gradient softly fades into whatever the parent surface is.
   */
  to?: string | undefined;
  /**
   * Origin (radial) or direction (linear). Default: `'top-left'`. The named values
   * map to `at X% Y%` for radial and `to <edge>` for linear.
   */
  position?: DivGradientPosition | undefined;
  /**
   * Radial-only size — accepts any CSS extent (`'80%'`, `'60% 60%'`, `'40rem'`).
   * Default: `'80% 80%'`. Ignored for linear gradients.
   */
  size?: string | undefined;
  /** Stop position for the start color. Default: `'0%'`. */
  fromStop?: string | undefined;
  /** Stop position for the end color. Default: `'70%'` (radial) / `'100%'` (linear). */
  toStop?: string | undefined;
}

/**
 * Public prop type for `<Div gradient />`:
 *
 *   - `true`  → emit the default theme-aware radial gradient.
 *   - `false` / `undefined` → no-op (no `backgroundImage` is written).
 *   - `string` → used verbatim as the `backgroundImage` (escape hatch — pass any
 *      CSS gradient / image URL / `linear-gradient(...)` you like).
 *   - `DivGradientConfig` → structured config; the helper assembles the CSS.
 */
export type DivGradient = boolean | string | DivGradientConfig;

const PALETTE_PREFIXES = [
  'primary',
  'secondary',
  'success',
  'warning',
  'danger',
  'info',
  'neutral',
];

const RADIAL_POSITION_MAP: Record<DivGradientPosition, string> = {
  'top-left': '0% 0%',
  top: '50% 0%',
  'top-right': '100% 0%',
  right: '100% 50%',
  'bottom-right': '100% 100%',
  bottom: '50% 100%',
  'bottom-left': '0% 100%',
  left: '0% 50%',
  center: '50% 50%',
};

const LINEAR_DIRECTION_MAP: Record<DivGradientPosition, string> = {
  'top-left': 'to top left',
  top: 'to top',
  'top-right': 'to top right',
  right: 'to right',
  'bottom-right': 'to bottom right',
  bottom: 'to bottom',
  'bottom-left': 'to bottom left',
  left: 'to left',
  center: 'to bottom',
};

/**
 * Resolve a `gradient` color value. Recognized palette token paths
 * (`primary.subtle`, `success.main`, …) become `var(--sds-palette-…)` so the
 * gradient automatically tracks the active theme — everything else (raw colors,
 * `var(...)`, `transparent`) flows through untouched.
 */
function resolveColor(value: string): string {
  if (!value) return value;
  if (value === 'transparent' || value === 'currentColor' || value === 'inherit') return value;
  if (value.startsWith('var(') || value.startsWith('#') || value.startsWith('rgb')) return value;
  if (value.startsWith('hsl') || value.startsWith('oklch')) return value;
  // Token form: bucket.level (e.g. "primary.subtle"). The first segment must be a
  // known palette bucket — otherwise we leave the value alone so consumers can
  // pass arbitrary CSS color keywords (`'red'`, `'aliceblue'`, ...).
  const head = value.split('.')[0] ?? '';
  if (PALETTE_PREFIXES.includes(head)) {
    return token(`palette.${value}`);
  }
  return value;
}

/**
 * Build a `background-image` CSS string from a `DivGradient` value. Returns
 * `undefined` when the prop is falsy / unset so the caller can leave the inline
 * style untouched.
 *
 * @example
 *   buildGradientBackground(true)
 *   // => 'radial-gradient(80% 80% at 0% 0%, var(--sds-palette-primary-subtle) 0%, transparent 70%)'
 *
 *   buildGradientBackground({ position: 'top', size: '60%', from: 'success.subtle' })
 *   // => 'radial-gradient(60% at 50% 0%, var(--sds-palette-success-subtle) 0%, transparent 70%)'
 *
 *   buildGradientBackground('radial-gradient(red, blue)')
 *   // => 'radial-gradient(red, blue)'
 */
export function buildGradientBackground(value: DivGradient | undefined): string | undefined {
  if (!value) return undefined;
  if (value === true) return buildFromConfig({});
  if (typeof value === 'string') return value;
  return buildFromConfig(value);
}

function buildFromConfig(config: DivGradientConfig): string {
  const type: DivGradientType = config.type ?? 'radial';
  const from = resolveColor(config.from ?? 'primary.subtle');
  const to = resolveColor(config.to ?? 'transparent');
  const fromStop = config.fromStop ?? '0%';

  if (type === 'linear') {
    const direction = LINEAR_DIRECTION_MAP[config.position ?? 'bottom'];
    const toStop = config.toStop ?? '100%';
    return `linear-gradient(${direction}, ${from} ${fromStop}, ${to} ${toStop})`;
  }

  const at = RADIAL_POSITION_MAP[config.position ?? 'top-left'];
  const size = config.size ?? '80% 80%';
  const toStop = config.toStop ?? '70%';
  return `radial-gradient(${size} at ${at}, ${from} ${fromStop}, ${to} ${toStop})`;
}