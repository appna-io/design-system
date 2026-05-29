'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { kbdRecipe } from './CommandPalette.recipe';
import type { KbdProps } from './CommandPalette.types';
import { detectHotkeyPlatform, macKey, type HotkeyPlatform } from './headless/platformKey';

/**
 * Tiny visual primitive for inline keyboard shortcuts. Renders as a semantic `<kbd>` element
 * (which AT users hear announced as "kbd …" with the contents, depending on the screen reader
 * configuration). When `keys` is supplied each token gets its own `<kbd>`, joined by a thin
 * `separator` span — this way `<Kbd keys={['Cmd', 'K']} />` reads as two distinct keypresses
 * rather than the literal string "Cmd+K".
 *
 * The `platform` axis routes through `macKey()` so `'cmd'` becomes `'⌘'` on Mac and `'Ctrl'`
 * elsewhere. `'auto'` (the default) reads from `navigator.platform`; specific values let docs
 * sites freeze the rendering ("show me how this looks on Windows").
 *
 * Useful well outside CommandPalette — docs prose, tooltips, menu rows, onboarding tours. Less
 * than 0.5 KB gz.
 */
function KbdImpl(props: KbdProps, ref: ForwardedRef<HTMLElement>): ReactElement {
  const {
    children,
    keys,
    separator = '+',
    size,
    variant,
    platform = 'auto',
    className,
    sx,
    style,
    ...rest
  } = props;

  const resolvedPlatform: HotkeyPlatform = platform === 'auto' ? detectHotkeyPlatform() : platform;

  const { className: cls, style: themedStyle } = useThemedClasses({
    recipe: kbdRecipe,
    componentName: 'Kbd',
    slot: 'root',
    props: { size, variant, className, sx, style },
  });

  // Single-key form
  if (!keys || keys.length === 0) {
    return (
      <kbd
        ref={ref}
        className={cls}
        style={(themedStyle as never) ?? undefined}
        data-size={size ?? 'md'}
        data-variant={variant ?? 'solid'}
        {...rest}
      >
        {typeof children === 'string' ? macKey(children, resolvedPlatform) : children}
      </kbd>
    );
  }

  // Multi-key form — render each token as its own kbd. We wrap in a span so the outer
  // element retains a single ref / className, and so consumers can target the group via CSS.
  return (
    <span
      ref={ref as ForwardedRef<HTMLSpanElement> as unknown as ForwardedRef<HTMLElement>}
      className="inline-flex items-center gap-1"
      data-size={size ?? 'md'}
      data-variant={variant ?? 'solid'}
      {...rest}
    >
      {keys.map((k, i) => (
        // Index-based key is acceptable here: `keys` is a typically-small ordered tuple, not
        // a mutable list. We compose with the token text for extra resilience.
        <span key={`${i}-${k}`} className="inline-flex items-center gap-1">
          {i > 0 ? <span aria-hidden="true" className="text-fg-muted">{separator}</span> : null}
          <kbd className={cls} style={(themedStyle as never) ?? undefined}>
            {macKey(k, resolvedPlatform)}
          </kbd>
        </span>
      ))}
    </span>
  );
}

export const Kbd = forwardRef<HTMLElement, KbdProps>(KbdImpl);
Kbd.displayName = 'Kbd';
