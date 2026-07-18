'use client';

import { buildPaletteGradient, forwardRef } from '@apx-ui/engine';
import { useThemedClasses } from '@apx-ui/theme';
import { useCallback, useId } from 'react';
import type { CSSProperties, KeyboardEvent, MouseEvent, ReactNode } from 'react';

import { Progress } from '../Progress/Progress';
import { Spinner } from '../Spinner/Spinner';

import {
  SPLASH_PARTICLE_BREATHE_DELAYS_MS,
  SPLASH_PARTICLE_INNER_ANGLES,
  SPLASH_PARTICLE_OUTER_ANGLES,
  SPLASH_PULSE_RING_DELAYS_MS,
  SPLASH_WAVE_COLOR_CLASS,
  splashScreenRecipes,
} from './SplashScreen.recipe';
import type {
  SplashGradient,
  SplashScreenColor,
  SplashScreenIndicator,
  SplashScreenPlacement,
  SplashScreenVariant,
  SplashScreenVisualProps,
} from './SplashScreen.types';

/**
 * Pure rendering primitive shared by `<SplashScreen>` (declarative) and `<SplashProvider>`
 * (imperative host).
 *
 * `<SplashSurface>` owns the visual composition — the variant decorations, the logo wrap, the
 * stack of title / subtitle / indicator / footer, and the ARIA wiring. It is **stateless**:
 * no open state, no portal, no timeout. Those concerns live in the two callers so they can
 * differ (declarative consumes `open` directly; the host drives lifecycle off `SplashStore`).
 *
 * The component is exported from this module but **not** from the package's public surface —
 * consumers should reach for `splash.show(…)` or `<SplashScreen>`, not this primitive.
 */

export interface SplashSurfaceProps extends SplashScreenVisualProps {
  /** Render position. Always `fullscreen` for the host; `inline` for declarative embeds. */
  placement?: SplashScreenPlacement | undefined;
  /** Click handler triggered when `closeOnClick` is true and the user clicks anywhere. */
  onRequestClose?: (() => void) | undefined;
}

export const SplashSurface = forwardRef<HTMLDivElement, SplashSurfaceProps>(function SplashSurface(
  props,
  ref,
) {
  const {
    variant: variantProp,
    color: colorProp,
    backdrop,
    gradient,

    logo,
    showLogo,
    title,
    subtitle,
    footer,

    indicator: indicatorProp,
    showSpinner,
    showProgress,
    progress,
    loadingLabel,

    placement = 'fullscreen',

    closeOnClick = false,

    className,
    style,
    sx,

    onRequestClose,
  } = props;

  const variant: SplashScreenVariant = resolveBase(variantProp, 'fade');
  const color: SplashScreenColor = resolveBase(colorProp, 'primary');
  const indicator: SplashScreenIndicator = resolveIndicator({
    indicator: indicatorProp,
    showSpinner,
    showProgress,
  });

  const reactId = useId();
  const titleId = `sds-splash-${reactId}-title`;
  const descId = `sds-splash-${reactId}-desc`;

  const { className: rootClass, style: rootStyle } = useThemedClasses({
    recipe: splashScreenRecipes.root,
    componentName: 'SplashScreen',
    slot: 'root',
    props: {
      placement,
      backdrop,
      color: colorProp,
      variant: variantProp,
      className,
      sx,
      style,
    },
  });

  const { className: stackClass } = useThemedClasses({
    recipe: splashScreenRecipes.stack,
    componentName: 'SplashScreen',
    slot: 'stack',
    props: {},
  });

  const { className: logoWrapClass } = useThemedClasses({
    recipe: splashScreenRecipes.logoWrap,
    componentName: 'SplashScreen',
    slot: 'logoWrap',
    props: { variant: variantProp },
  });

  const { className: titleClass } = useThemedClasses({
    recipe: splashScreenRecipes.title,
    componentName: 'SplashScreen',
    slot: 'title',
    props: {},
  });

  const { className: subtitleClass } = useThemedClasses({
    recipe: splashScreenRecipes.subtitle,
    componentName: 'SplashScreen',
    slot: 'subtitle',
    props: {},
  });

  const { className: indicatorClass } = useThemedClasses({
    recipe: splashScreenRecipes.indicator,
    componentName: 'SplashScreen',
    slot: 'indicator',
    props: {},
  });

  const { className: footerClass } = useThemedClasses({
    recipe: splashScreenRecipes.footer,
    componentName: 'SplashScreen',
    slot: 'footer',
    props: {},
  });

  // Click / keyboard dismiss handlers. The surface itself never owns dismiss state — it just
  // forwards the intent to the caller via `onRequestClose`.
  const handleClick = useCallback(
    (_event: MouseEvent<HTMLDivElement>) => {
      if (closeOnClick) {
        onRequestClose?.();
      }
    },
    [closeOnClick, onRequestClose],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      // Enter / Space mirror the click dismiss so keyboard users have parity. Escape is
      // handled one level up by the caller via `useEscapeStack` (so nested overlays unwind
      // in the right order).
      if (closeOnClick && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onRequestClose?.();
      }
    },
    [closeOnClick, onRequestClose],
  );

  const shouldShowLogo = showLogo ?? logo != null;
  const logoNode = shouldShowLogo && logo != null ? logo : null;

  // ARIA wiring — the splash is a status landmark with title labelling and subtitle describing.
  const ariaAttrs: Record<string, string | boolean | undefined> = {
    role: 'status',
    'aria-busy': true,
    'aria-live': 'polite',
  };

  if (title != null) {
    ariaAttrs['aria-labelledby'] = titleId;
  } else {
    ariaAttrs['aria-label'] = loadingLabel ?? 'Loading';
  }
  if (subtitle != null) {
    ariaAttrs['aria-describedby'] = descId;
  }

  return (
    /* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex --
       dismiss-on-click overlay: click/Escape/Enter all dismiss (handleKeyDown); a button role would
       misannounce a full-screen branding surface. */
    <div
      ref={ref}
      data-variant={variant}
      data-color={color}
      data-placement={placement}
      className={rootClass}
      style={rootStyle}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={closeOnClick ? 0 : undefined}
      {...ariaAttrs}
    >
      {/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-tabindex */}
      <VariantDecorations variant={variant} color={color} gradient={gradient} />

      <div className={stackClass}>
        {logoNode != null ? (
          <div className={logoWrapClass} aria-hidden={title != null ? 'true' : undefined}>
            {variant === 'pulse' ? <PulseRings color={color} /> : null}
            {variant === 'particles' ? <ParticleOrbits color={color} /> : null}
            <div className="relative z-10 inline-flex h-full w-full items-center justify-center">
              {logoNode}
            </div>
          </div>
        ) : null}

        {title != null ? (
          <h1 id={titleId} className={titleClass}>
            {title}
          </h1>
        ) : null}

        {subtitle != null ? (
          <p id={descId} className={subtitleClass}>
            {subtitle}
          </p>
        ) : null}

        {indicator !== 'none' ? (
          <div className={indicatorClass}>
            <SplashIndicator
              indicator={indicator}
              progress={progress}
              color={color}
              loadingLabel={loadingLabel}
            />
          </div>
        ) : null}

        {footer != null ? <div className={footerClass}>{footer}</div> : null}
      </div>
    </div>
  );
}, 'SplashSurface');

// ── Variant decorations ────────────────────────────────────────────────────────────────────────

interface VariantDecorationsProps {
  variant: SplashScreenVariant;
  color: SplashScreenColor;
  gradient: SplashGradient | undefined;
}

function VariantDecorations({ variant, color, gradient }: VariantDecorationsProps): ReactNode {
  if (variant === 'gradient') return <GradientLayer color={color} gradient={gradient} />;
  if (variant === 'wave') return <WaveLayer color={color} />;
  return null;
}

interface GradientLayerProps {
  color: SplashScreenColor;
  gradient: SplashGradient | undefined;
}

function GradientLayer({ color, gradient }: GradientLayerProps): ReactNode {
  const { className } = useThemedClasses({
    recipe: splashScreenRecipes.gradient,
    componentName: 'SplashScreen',
    slot: 'gradient',
    props: {},
  });
  // Resolution order:
  //   1. Caller passed a `gradient` prop → resolve via `resolveCustomGradient`
  //   2. Otherwise → ask the engine to build one from the active palette `color`.
  // Either way the result is a CSS string referencing only theme variables / caller-supplied
  // colors — no concrete colors are ever baked in at component compile time.
  const backgroundImage =
    resolveCustomGradient(gradient, color) ?? buildPaletteGradient(color);
  const layerStyle: CSSProperties = {
    backgroundImage,
    backgroundSize: '200% 200%',
    backgroundRepeat: 'no-repeat',
  };
  return <div aria-hidden="true" className={className} style={layerStyle} />;
}

/**
 * Resolve a `SplashGradient` input into a CSS `background-image` value.
 *
 *   - `undefined`             → `undefined` (caller falls back to the per-role preset)
 *   - `string`                → returned verbatim (full escape hatch: `radial-gradient(...)`,
 *                                                 `conic-gradient(...)`, etc.)
 *   - `string[]`              → equally-spaced 135° linear-gradient
 *   - `{ from, via?, to, angle? }` → linear-gradient with explicit stops + optional mid
 *
 * The animated `splash-gradient-shift` keyframe relies on `background-size: 200% 200%`
 * (set by the layer style above), so any gradient passed here animates by default. To opt
 * out of the animation, override the `gradient` slot via theme styleOverrides.
 */
/**
 * Resolve a `SplashGradient` input into a CSS `background-image` value.
 *
 * Five input shapes (the type union in `SplashGradient`):
 *
 *   - `undefined`              → `undefined` (caller falls back to `buildPaletteGradient(color)`)
 *   - `string`                 → returned verbatim
 *   - `readonly string[]`      → equally-spaced 135° linear-gradient of the given stops
 *   - `{ from, via?, to, … }`  → linear-gradient with explicit stops + optional mid + angle
 *   - `BuildPaletteGradientOptions` (`{ stops?, angle?, kind?, varPrefix? }`)
 *                              → engine-built gradient using the active `color` role
 *
 * The two object shapes share `angle` — we disambiguate them by checking for the
 * `{ from, to }` keys (the custom-color form). Anything else is treated as the engine
 * options form.
 */
function resolveCustomGradient(
  input: SplashGradient | undefined,
  role: SplashScreenColor,
): string | undefined {
  if (input === undefined) return undefined;
  if (typeof input === 'string') return input;

  if (Array.isArray(input)) {
    // `as readonly string[]` because `Array.isArray` doesn't narrow `readonly string[]`
    // cleanly when it's part of a union with non-array members. The runtime check is
    // correct; the cast just restores the type info.
    const stops = input as readonly string[];
    if (stops.length === 0) return undefined;
    if (stops.length === 1) {
      // Single stop = flat fill. Express it as a one-color gradient so the animation has
      // something to scroll across (otherwise it'd be a static color).
      return `linear-gradient(135deg, ${stops[0]} 0%, ${stops[0]} 100%)`;
    }
    const joined = stops
      .map((color, i) => `${color} ${Math.round((i / (stops.length - 1)) * 100)}%`)
      .join(', ');
    return `linear-gradient(135deg, ${joined})`;
  }

  // Object form. Discriminate between the two shapes by checking for the custom-color
  // form's required keys (`from` + `to`). The engine-options form has neither.
  const obj = input as Record<string, unknown>;
  if (typeof obj.from === 'string' && typeof obj.to === 'string') {
    const from = obj.from;
    const to = obj.to;
    const via = typeof obj.via === 'string' ? obj.via : undefined;
    const angle = typeof obj.angle === 'number' ? obj.angle : 135;
    // `via` is optional — drop the middle stop entirely when missing so the gradient stays
    // a clean two-stop sweep instead of doubling the `from` color.
    if (via !== undefined) {
      return `linear-gradient(${angle}deg, ${from} 0%, ${via} 50%, ${to} 100%)`;
    }
    return `linear-gradient(${angle}deg, ${from} 0%, ${to} 100%)`;
  }

  // Engine-options form — delegate to `buildPaletteGradient`. Lets consumers tweak the
  // shape of the theme-derived default ("primary, but radial with reversed stops") without
  // re-implementing the CSS-var composition.
  return buildPaletteGradient(role, obj as Parameters<typeof buildPaletteGradient>[1]);
}

interface WaveLayerProps {
  color: SplashScreenColor;
}

function WaveLayer({ color }: WaveLayerProps): ReactNode {
  const { className } = useThemedClasses({
    recipe: splashScreenRecipes.wave,
    componentName: 'SplashScreen',
    slot: 'wave',
    props: {},
  });
  const tint = SPLASH_WAVE_COLOR_CLASS[color] ?? SPLASH_WAVE_COLOR_CLASS.primary!;
  return (
    <div aria-hidden="true" className={`${className} ${tint}`}>
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="block h-32 w-full opacity-30 animate-splash-wave-back motion-reduce:animate-none"
        aria-hidden="true"
      >
        <path
          d="M0,128 C320,200 720,32 1080,96 C1280,128 1380,128 1440,96 L1440,220 L0,220 Z"
          fill="currentColor"
        />
      </svg>
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="-mt-24 block h-32 w-full opacity-50 animate-splash-wave motion-reduce:animate-none"
        aria-hidden="true"
      >
        <path
          d="M0,96 C240,160 600,16 960,80 C1200,128 1320,160 1440,128 L1440,220 L0,220 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

// ── Pulse rings ────────────────────────────────────────────────────────────────────────────────

interface PulseRingsProps {
  color: SplashScreenColor;
}

function PulseRings({ color }: PulseRingsProps): ReactNode {
  const { className } = useThemedClasses({
    recipe: splashScreenRecipes.pulseRing,
    componentName: 'SplashScreen',
    slot: 'pulseRing',
    props: { color },
  });
  return (
    <>
      {SPLASH_PULSE_RING_DELAYS_MS.map((delay, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={className}
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </>
  );
}

// ── Particle orbits ────────────────────────────────────────────────────────────────────────────

interface ParticleOrbitsProps {
  color: SplashScreenColor;
}

function ParticleOrbits({ color }: ParticleOrbitsProps): ReactNode {
  const { className: orbitClass } = useThemedClasses({
    recipe: splashScreenRecipes.orbit,
    componentName: 'SplashScreen',
    slot: 'orbit',
    props: {},
  });
  const { className: particleClass } = useThemedClasses({
    recipe: splashScreenRecipes.particle,
    componentName: 'SplashScreen',
    slot: 'particle',
    props: { color },
  });

  return (
    <>
      <div aria-hidden="true" className={orbitClass} style={{ animationDuration: '6s' }}>
        {SPLASH_PARTICLE_INNER_ANGLES.map((angle, i) => {
          const { left, top } = angleToPercent(angle, 1.0);
          return (
            <span
              key={`inner-${i}`}
              className={particleClass}
              style={{
                left: `calc(${left}% - 5px)`,
                top: `calc(${top}% - 5px)`,
                animationDelay: `${SPLASH_PARTICLE_BREATHE_DELAYS_MS(i)}ms`,
              }}
            />
          );
        })}
      </div>
      <div
        aria-hidden="true"
        className={orbitClass}
        style={{ animationDuration: '10s', animationDirection: 'reverse' }}
      >
        {SPLASH_PARTICLE_OUTER_ANGLES.map((angle, i) => {
          const { left, top } = angleToPercent(angle, 1.35);
          return (
            <span
              key={`outer-${i}`}
              className={particleClass}
              style={{
                left: `calc(${left}% - 5px)`,
                top: `calc(${top}% - 5px)`,
                width: '14px',
                height: '14px',
                opacity: 0.85,
                animationDelay: `${SPLASH_PARTICLE_BREATHE_DELAYS_MS(i + 4)}ms`,
              }}
            />
          );
        })}
      </div>
    </>
  );
}

function angleToPercent(angleDeg: number, radius: number): { left: number; top: number } {
  const rad = (angleDeg * Math.PI) / 180;
  const left = 50 + 50 * radius * Math.cos(rad);
  const top = 50 + 50 * radius * Math.sin(rad);
  return { left, top };
}

// ── Indicator (spinner / progress) ─────────────────────────────────────────────────────────────

interface SplashIndicatorProps {
  indicator: SplashScreenIndicator;
  progress: number | undefined;
  color: SplashScreenColor;
  loadingLabel: string | undefined;
}

function SplashIndicator(props: SplashIndicatorProps): ReactNode {
  const { indicator, progress, color, loadingLabel } = props;

  if (indicator === 'spinner') {
    return <Spinner size="lg" color={color} label={loadingLabel ?? 'Loading'} />;
  }

  if (indicator === 'progress') {
    const isDeterminate = typeof progress === 'number' && Number.isFinite(progress);
    if (isDeterminate) {
      return (
        <Progress
          value={progress}
          color={color}
          size="sm"
          rounded="full"
          aria-label={loadingLabel ?? 'Loading'}
        />
      );
    }
    return (
      <Progress
        indeterminate
        color={color}
        size="sm"
        rounded="full"
        aria-label={loadingLabel ?? 'Loading'}
      />
    );
  }

  return null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────────────────────

function resolveBase<T>(value: T | { base?: T } | undefined, fallback: T): T {
  if (value == null) return fallback;
  if (typeof value === 'object' && value !== null && 'base' in (value as object)) {
    return ((value as { base?: T }).base ?? fallback) as T;
  }
  return value as T;
}

function resolveIndicator(args: {
  indicator: SplashScreenIndicator | undefined;
  showSpinner: boolean | undefined;
  showProgress: boolean | undefined;
}): SplashScreenIndicator {
  if (args.showSpinner) return 'spinner';
  if (args.showProgress) return 'progress';
  return args.indicator ?? 'none';
}