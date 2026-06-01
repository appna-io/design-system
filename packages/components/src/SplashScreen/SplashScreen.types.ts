import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import type { BuildPaletteGradientOptions, ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Visual style of the splash surface. Each variant pairs a backdrop treatment with a logo /
 * content stack animation so the splash reads as a complete first-paint moment, not just a
 * loading rectangle.
 *
 * | Variant     | Look & feel                                          | When to reach for it                                    |
 * | ----------- | ---------------------------------------------------- | ------------------------------------------------------- |
 * | `fade`      | Clean solid backdrop, logo scales + fades in         | **Default.** Minimal first-paint for utility apps.      |
 * | `pulse`     | Three concentric "radar" rings expanding from logo   | Connection / sync flows, IoT apps, anything "live".     |
 * | `gradient`  | Flowing animated multi-stop gradient backdrop        | Marketing-grade brand-immersive splashes.               |
 * | `particles` | Logo with eight orbiting + breathing particles       | Playful / consumer apps, onboarding intros.             |
 * | `wave`      | Two parallaxing wave bands at the bottom, calm copy  | Travel / hospitality / nature-leaning brands.           |
 *
 * All five animations are pure CSS — no Motion library, no JS frame loop. Each keyframe is
 * registered in `packages/theme/src/tailwind-preset.ts` so any preset consumer gets the
 * utilities without an extra `globals.css` import. Under `prefers-reduced-motion` every
 * animation halts (Tailwind's `motion-reduce:` variant) while the static composition stays
 * visible.
 */
export type SplashScreenVariant = 'fade' | 'pulse' | 'gradient' | 'particles' | 'wave';

/**
 * Semantic palette role driving the splash accent — backdrop tint (for `gradient`), ring color
 * (`pulse`), particle color (`particles`), wave fill (`wave`), and the Spinner / Progress
 * accent across every variant. `primary` is the default since splash screens are typically
 * brand-led.
 */
export type SplashScreenColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

/**
 * Backdrop treatment. Independent from `variant` so a `pulse` ring can sit on a `solid` brand
 * surface or a `gradient` surface depending on the host app's look.
 *
 * - `solid` — single flat `bg-bg-default` surface (the default).
 * - `paper` — `bg-bg-paper`, a half-step warmer surface that pairs with brand logos that have
 *   their own gradient.
 * - `tinted` — `bg-{color}-subtle`. Picks up the `color` prop so the splash reads as part of
 *   the brand palette.
 * - `transparent` — no backdrop fill. The right pick when the splash overlays another splash
 *   asset (e.g. an Electron window with an OS-level backdrop).
 */
export type SplashScreenBackdrop = 'solid' | 'paper' | 'tinted' | 'transparent';

/**
 * Loading indicator style for the central activity affordance. The splash can pair its visual
 * variant with **either** a Spinner (indeterminate) **or** a Progress bar (determinate or
 * indeterminate) — not both at once.
 *
 * - `none`     — no indicator. Pure animated logo. Use when the splash duration is governed
 *   entirely by `timeout`.
 * - `spinner`  — renders `<Spinner />`. The right pick when you don't know how long startup
 *   will take.
 * - `progress` — renders a determinate horizontal `<Progress />` bar driven by the `progress`
 *   prop (0..100). When `progress` is omitted the bar paints its indeterminate sweep.
 */
export type SplashScreenIndicator = 'none' | 'spinner' | 'progress';

/**
 * Custom gradient spec for `variant='gradient'`. Overrides the **default theme-derived
 * gradient** (engine-generated from `buildPaletteGradient(color)`) so you can paint the
 * splash with arbitrary brand colors — a marketing launch, a seasonal theme, a customer-
 * specific subdomain.
 *
 * When this prop is omitted, the splash uses `buildPaletteGradient(color)` from
 * `@apx-ui/engine` — a theme-aware generator that builds a gradient string from
 * `--sds-palette-{role}-{slot}` CSS variables. The result re-tints automatically when the
 * theme switches mode (light / dark) or palette variant.
 *
 * Five input shapes — pick whichever matches how you carry the colors:
 *
 * 1. **Full CSS string** — drop-in escape hatch for anything the structured form can't
 *    express (`radial-gradient`, `conic-gradient`, multi-stop fades, etc.). Whatever you
 *    pass becomes the layer's `background-image` verbatim.
 *
 *        splash.gradient({ gradient: 'radial-gradient(circle, #ff5722, #1e293b)' })
 *
 * 2. **Stop array** — equally-spaced linear gradient at the default 135° angle. The
 *    most ergonomic form for the common "brand-A → brand-B → brand-A" case.
 *
 *        splash.gradient({ gradient: ['#ff5722', '#ffeb3b', '#4caf50'] })
 *
 * 3. **Structured object** — explicit `from` / `via` / `to` stops with an optional
 *    `angle`. Best when you want one stop semantically separated (e.g. `via` for a
 *    distinct mid-tone) or when you carry the angle alongside the colors.
 *
 *        splash.gradient({
 *          gradient: { from: '#0ea5e9', via: '#8b5cf6', to: '#ec4899', angle: 120 }
 *        })
 *
 * 4. **Palette gradient options** — the engine's `buildPaletteGradient(role, options)`
 *    shape. Use this to tweak the **shape** of the theme-derived default (different angle,
 *    different stop sequence, radial instead of linear) without leaving the palette.
 *
 *        splash.gradient({
 *          color: 'primary',
 *          gradient: { angle: 90, kind: 'radial', stops: ['hover', 'main', 'active'] },
 *        })
 *
 * 5. **CSS variable references** — any of shapes 1–3 can reference theme tokens via
 *    `var(--sds-palette-primary-main)` so a custom splash still re-tints under
 *    light / dark mode flips.
 *
 *        splash.gradient({
 *          gradient: {
 *            from: 'var(--sds-palette-primary-main)',
 *            to:   'var(--sds-palette-info-main)',
 *          }
 *        })
 *
 * Color values can be any CSS color expression — hex, rgb(), oklch(), color(), a named
 * color, or a `var(--…)` reference. The component does **not** validate them; pass valid
 * CSS or the browser will reject the gradient and the layer will fall back to transparent.
 */
export type SplashGradient =
  | string
  | readonly string[]
  | {
      /** Start stop. Required. */
      from: string;
      /** Optional middle stop. Omit for a two-stop gradient. */
      via?: string | undefined;
      /** End stop. Required. */
      to: string;
      /**
       * Gradient angle in degrees. Defaults to `135` — matches the per-role preset gradients
       * so swapping a preset for a custom gradient doesn't change the direction.
       */
      angle?: number | undefined;
    }
  | BuildPaletteGradientOptions;

/**
 * Render position. Splash screens default to `fullscreen` (the canonical "fixed inset-0,
 * z-modal" treatment) because that's the 99% case. `inline` skips the fixed positioning and
 * lets the splash sit inside whatever flow container the consumer provides — useful for
 * embedding the same composition inside a Card / Modal / dev-preview tile.
 *
 * The imperative `splash.show(…)` facade only renders fullscreen — the `inline` placement is
 * the escape hatch for the rare consumer that needs to embed the visual primitive inside
 * another layout container without going through the host.
 */
export type SplashScreenPlacement = 'fullscreen' | 'inline';

/**
 * The "looks-only" subset of `SplashScreenProps`. Used as the shape that the imperative
 * `splash.show(…)` API accepts (plus `id`, `timeout`, `onHide`) and that the host applies to
 * the active record. Everything that pertains to lifecycle / portal / DOM identity stays on
 * the declarative `<SplashScreen />` component instead — those don't make sense on an
 * imperative call.
 */
export interface SplashScreenVisualProps {
  // ── Visual / brand ───────────────────────────────────────────────────────────────────────────
  /** Visual style. @default 'fade' */
  variant?: ResponsiveValue<SplashScreenVariant> | undefined;
  /** Semantic palette role driving accents (rings / particles / waves / spinner). @default 'primary' */
  color?: ResponsiveValue<SplashScreenColor> | undefined;
  /** Backdrop treatment. @default 'solid' */
  backdrop?: ResponsiveValue<SplashScreenBackdrop> | undefined;
  /**
   * Custom gradient for `variant='gradient'`. Overrides the default per-role gradient
   * picked from `SPLASH_GRADIENT_BY_COLOR[color]`. Accepts a full CSS gradient string, an
   * array of stops (135° linear), or a `{ from, via?, to, angle? }` object — see
   * `SplashGradient` for the full shape with examples.
   *
   * Ignored when `variant !== 'gradient'`.
   */
  gradient?: SplashGradient | undefined;

  // ── Content ──────────────────────────────────────────────────────────────────────────────────
  /**
   * Brand mark. Accepts any ReactNode — an `<img>`, an inline SVG, a `<MyLogo />` component.
   * The splash renders a `flex` container around it sized by the variant (typically 96–128px
   * across) and applies the variant's entrance animation to the wrapper, not to your logo
   * element, so internal logo animations (e.g. a Lottie file) play independently.
   */
  logo?: ReactNode;
  /** Hide the logo wrapper entirely. @default true when `logo` is passed */
  showLogo?: boolean | undefined;
  /** Title text or node. Renders below the logo in the variant's title slot. */
  title?: ReactNode;
  /** Subtitle / tagline. Renders below the title in muted color. */
  subtitle?: ReactNode;
  /**
   * Slot for arbitrary extra content (legal copy, version string, etc.) rendered below the
   * indicator. Use sparingly — the splash should stay scan-in-300ms minimal.
   */
  footer?: ReactNode;

  // ── Loading indicator ────────────────────────────────────────────────────────────────────────
  /** Loading indicator style. @default 'none' */
  indicator?: SplashScreenIndicator | undefined;
  /** Shorthand for `indicator='spinner'`. Wins over `indicator` when both are set. */
  showSpinner?: boolean | undefined;
  /** Shorthand for `indicator='progress'`. Wins over `indicator` when both are set. */
  showProgress?: boolean | undefined;
  /**
   * Determinate progress value (0–100). Only meaningful when `indicator='progress'` (or
   * `showProgress` is `true`). Omit to render the indeterminate sweep.
   */
  progress?: number | undefined;
  /**
   * Accessible label for the spinner / progress indicator. Defaults to `'Loading'`.
   * Override to localize or to disambiguate (`'Initializing workspace'`, `'Syncing data'`).
   */
  loadingLabel?: string | undefined;

  // ── Behavior ─────────────────────────────────────────────────────────────────────────────────
  /**
   * When `true`, clicking anywhere on the splash dismisses it. Useful for "tap to continue"
   * intros — pairs naturally with `timeout` being omitted / very long. @default false
   */
  closeOnClick?: boolean | undefined;
  /**
   * When `true`, pressing Escape dismisses the splash. The imperative facade defaults this to
   * `true` (splashes triggered by code are usually dismissible) while the declarative
   * `<SplashScreen>` defaults to `false` (forced first paint). @default depends on call site
   */
  closeOnEscape?: boolean | undefined;

  // ── Themed style escape hatches ──────────────────────────────────────────────────────────────
  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
  /** Plain inline style. Merged last so it wins over the recipe-derived style. */
  style?: CSSProperties | undefined;
  /** Additional class names merged onto the root via `tailwind-merge`. */
  className?: string | undefined;
}

/**
 * The shape `splash.show(…)` accepts. Extends the visual props with lifecycle callbacks plus
 * an optional `id` for dedup / update.
 */
export interface SplashShowOptions extends SplashScreenVisualProps {
  /**
   * Stable identifier. Re-calling `splash.show({ id, … })` updates the existing record in
   * place (preserving `createdAt` so the timeout math stays stable). Omit to generate a
   * fresh id; the show function returns the id either way.
   */
  id?: string | undefined;
  /**
   * Auto-dismiss delay in milliseconds. Set to `0` (or omit) to disable the timer — the
   * splash stays visible until `splash.hide(id)` is called.
   */
  timeout?: number | undefined;
  /** Fires once when `timeout` elapses. */
  onTimeout?: ((id: string) => void) | undefined;
  /**
   * Fires once when the splash is dismissed by **any** mechanism (timeout, click, escape,
   * manual `splash.hide()`, replaced by a new `splash.show()`). Use this for cleanup that has
   * to run regardless of how the splash closed.
   */
  onHide?: ((id: string) => void) | undefined;
}

/**
 * Internal record shape stored by `SplashStore`. Mirrors `SplashShowOptions` with the
 * id / createdAt fields resolved to concrete values.
 */
export interface SplashScreenItem extends SplashScreenVisualProps {
  id: string;
  timeout: number | undefined;
  onTimeout: ((id: string) => void) | undefined;
  onHide: ((id: string) => void) | undefined;
  createdAt: number;
}

/**
 * The public imperative facade. Callable as a function or via the variant-aliased properties.
 *
 *   splash({ variant: 'pulse', logo, title: 'Syncing…' })
 *   splash.pulse({ logo, title: 'Syncing…' })
 *   splash.gradient({ logo, title: 'Welcome', showProgress: true, progress: 0 })
 *   splash.hide()                                 // dismiss the active splash
 *   splash.update(id, { progress: 50 })           // patch in place (drive progress bars)
 *   splash.isActive(id?)                          // probe — true if any / specific id is open
 */
export interface SplashApi {
  /** Show a splash. Returns the resolved id. */
  (options?: SplashShowOptions): string;
  /** Alias — same signature as the callable form, exposed for clarity. */
  show: (options?: SplashShowOptions) => string;
  /** Variant shortcut. Omits the need to pass `variant: 'fade'`. */
  fade: (options?: Omit<SplashShowOptions, 'variant'>) => string;
  /** Variant shortcut for `pulse`. */
  pulse: (options?: Omit<SplashShowOptions, 'variant'>) => string;
  /** Variant shortcut for `gradient`. */
  gradient: (options?: Omit<SplashShowOptions, 'variant'>) => string;
  /** Variant shortcut for `particles`. */
  particles: (options?: Omit<SplashShowOptions, 'variant'>) => string;
  /** Variant shortcut for `wave`. */
  wave: (options?: Omit<SplashShowOptions, 'variant'>) => string;
  /**
   * Dismiss a splash. Pass an id to dismiss a specific record (no-op if it's not active);
   * omit to dismiss whichever splash is currently visible.
   */
  hide: (id?: string) => void;
  /**
   * Patch a splash's visual props in place. The common case is driving a determinate
   * `progress` bar from a fetch / upload promise: `splash.update(id, { progress: 50 })`.
   * If `id` is not the active splash, the call is a no-op.
   */
  update: (id: string, patch: Partial<SplashShowOptions>) => void;
  /** Returns `true` if a splash is currently visible (optionally matching a specific id). */
  isActive: (id?: string) => boolean;
}

/**
 * Props for the declarative `<SplashScreen>` primitive. Power users reach for this when they
 * want a splash declaratively (e.g. a Storybook example, an inline embed) instead of going
 * through the imperative facade. 99% of consumers should use `splash.show(…)` instead.
 */
export interface SplashScreenProps
  extends SplashScreenVisualProps,
    Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'title' | 'style' | 'className'> {
  // ── Visibility / lifecycle ───────────────────────────────────────────────────────────────────
  /**
   * Controlled visibility. When omitted the splash uses `defaultOpen` (`true`) so the canonical
   * "show on first render, hide after timeout" pattern needs zero state wiring.
   */
  open?: boolean | undefined;
  /** Uncontrolled initial visibility. @default true */
  defaultOpen?: boolean | undefined;
  /**
   * Auto-dismiss delay in milliseconds. Set to `0` (or omit when paired with explicit
   * `open` control) to disable the timer. When the timer fires the splash transitions to
   * `open=false` and `onTimeout` / `onOpenChange` fire in that order.
   */
  timeout?: number | undefined;
  /** Fires once when `timeout` elapses (does not fire on manual / controlled close). */
  onTimeout?: (() => void) | undefined;
  /** Fires whenever the splash's open state changes — manual close, timeout, controlled flip. */
  onOpenChange?: ((open: boolean) => void) | undefined;

  // ── Layout (declarative-only) ────────────────────────────────────────────────────────────────
  /** Render position. @default 'fullscreen' */
  placement?: SplashScreenPlacement | undefined;
  /**
   * Mount the (fullscreen) splash inside a Portal so it overlays the entire viewport regardless
   * of where it sits in the React tree. Ignored when `placement='inline'`. @default true
   */
  portal?: boolean | undefined;
  /** Mount target for the portal. Defaults to `document.body`. */
  portalContainer?: HTMLElement | null | undefined;
}

/**
 * Props for the singleton `<SplashProvider>` host. Mount **once** at the app root (alongside
 * `<ThemeProvider>`) — every `splash.show(…)` call across the app feeds into this instance via
 * the module-level `SplashStore`.
 */
export interface SplashProviderProps {
  /**
   * Default options applied to every `splash.show(…)` call unless overridden. Useful for
   * pinning a brand `color` / `variant` / `closeOnEscape` policy across the whole app.
   */
  defaultOptions?: SplashShowOptions | undefined;
  /**
   * Mount target for the splash portal. Defaults to `document.body`. Pass an element ref's
   * `current` to scope splashes inside a specific subtree (e.g. an Electron window root).
   */
  portalContainer?: HTMLElement | null | undefined;
}

/**
 * Internal context value piped from the root to subparts (currently unused — the splash is
 * single-slot and renders all subparts inside the root render. Exported in case a future
 * compound-children mode wants to read variant / size from a context).
 */
export interface SplashScreenContextValue {
  variant: SplashScreenVariant;
  color: SplashScreenColor;
}