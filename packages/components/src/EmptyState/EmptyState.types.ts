import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  HTMLAttributes,
  ReactNode,
} from 'react';
import type { ResponsiveValue, Sx } from '@apx-ui/engine';

/**
 * Visual + semantic family. Selects the root ARIA role, the icon container tint, and (for
 * `loading`) auto-injects a `<Spinner />` in the icon slot.
 *
 * | variant     | Root role                                     | Icon container tint                  | Auto-glyph             |
 * | ----------- | --------------------------------------------- | ------------------------------------ | ---------------------- |
 * | `default`   | `region` (with `aria-label` when applicable)   | neutral subtle                       | none                   |
 * | `error`     | `alert`                                       | danger-subtle bg + danger fg         | none (consumer-supplied) |
 * | `loading`   | `status` + `aria-busy="true"` + `aria-live`   | neutral subtle                       | `<Spinner />`          |
 * | `success`   | `region`                                      | success-subtle bg + success fg       | none (consumer-supplied) |
 */
export type EmptyStateVariant = 'default' | 'error' | 'loading' | 'success';

/** Density token. Cascades to title size, description size, icon container size, and root padding. */
export type EmptyStateSize = 'sm' | 'md' | 'lg';

/**
 * Layout alignment.
 *
 * - `center` — most empty surfaces; "no users yet" / "no results" / first-run.
 * - `start`  — inline next to other content (e.g. a sidebar panel that's empty).
 */
export type EmptyStateAlign = 'center' | 'start';

/**
 * Discriminated union for the action shortcut shape. Either `onClick` (renders a real `<button>`)
 * or `href` (renders a `<Button asChild><a href=…>`). All other props are forwarded to the
 * underlying `<Button>`.
 */
export interface EmptyStateActionShortcut
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Visible button label. */
  label: ReactNode;
  /** Render as an anchor by routing through Button's `asChild`. Mutually exclusive with `onClick`. */
  href?: string | undefined;
  /** Anchor `target` attribute. Only meaningful when `href` is set. */
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'] | undefined;
  /** Anchor `rel` attribute. Only meaningful when `href` is set. */
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>['rel'] | undefined;
  /** Button visual variant override. @default 'solid' for primaryAction, 'ghost' for secondaryAction */
  variant?: 'solid' | 'outline' | 'ghost' | undefined;
  /** Button color override. @default 'primary' for primaryAction, 'neutral' for secondaryAction */
  color?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'neutral'
    | undefined;
}

export interface EmptyStateProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  /** Visual + semantic family. @default 'default' */
  variant?: ResponsiveValue<EmptyStateVariant> | undefined;
  /** Density token. @default 'md' */
  size?: ResponsiveValue<EmptyStateSize> | undefined;
  /** Layout alignment. @default 'center' */
  align?: ResponsiveValue<EmptyStateAlign> | undefined;
  /**
   * Wrap the root in a dashed border container. The right choice for DataGrid-style empty slots
   * where the EmptyState needs to fill an existing rectangle. @default false
   */
  bordered?: boolean | undefined;
  /**
   * Pad the root vertically per size token. Disable for inline use in a layout that already
   * provides its own padding. @default true
   */
  padded?: boolean | undefined;
  /**
   * Element name for the root. Semantic landmark — `<section>` is the default so screen-reader
   * users can navigate to / from the empty region.
   */
  as?: 'section' | 'div' | 'aside' | 'article' | undefined;

  // ── Prop-driven shortcuts ──────────────────────────────────────────────────────────────────────
  // When **any** compound child is detected (via `Children.toArray`), every shortcut below is
  // ignored — compound children give consumers full control without prop-shortcut collisions.
  /** Small leading glyph rendered inside the icon container. Mutually exclusive with `illustration`. */
  icon?: ReactNode;
  /** Larger illustration (replaces the icon container entirely). Wins over `icon` if both set. */
  illustration?: ReactNode;
  /** Title text or node. Becomes the accessible label / heading. */
  title?: ReactNode;
  /** Description text or node. Becomes the accessible description (`aria-describedby`). */
  description?: ReactNode;
  /** Primary CTA. `{ label, onClick? | href?, ...buttonProps }`. */
  primaryAction?: EmptyStateActionShortcut | undefined;
  /** Secondary CTA. Same shape as `primaryAction`. */
  secondaryAction?: EmptyStateActionShortcut | undefined;

  /** Theme-aware inline style object (resolves palette / spacing / radius tokens to CSS vars). */
  sx?: Sx | undefined;
}

export interface EmptyStateContextValue {
  size: EmptyStateSize;
  variant: EmptyStateVariant;
  align: EmptyStateAlign;
}

export interface EmptyStateIconProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

export interface EmptyStateIllustrationProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}

export interface EmptyStateTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level override. @default 'h3' */
  as?: 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'div' | undefined;
  sx?: Sx | undefined;
}

export interface EmptyStateDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  sx?: Sx | undefined;
}

export interface EmptyStateActionsProps extends HTMLAttributes<HTMLDivElement> {
  sx?: Sx | undefined;
}
