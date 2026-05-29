'use client';

import { useThemedClasses } from '@apx-ui/theme';
import { forwardRef, type ForwardedRef, type ReactElement } from 'react';

import { drawerHeaderRecipe } from './Drawer.recipe';
import { useDrawerContext } from './DrawerContext';
import type { DrawerHeaderProps } from './Drawer.types';

/**
 * Drawer header. Same three-slot layout as Modal's:
 *
 *   [ avatar ] [ title + description ]                    [ action ]
 *
 * `title` and `description` are wired to the Drawer's context-managed `titleId` / `descId`,
 * which Content carries on `aria-labelledby` / `aria-describedby`. ARIA association is automatic.
 */
function DrawerHeaderImpl(
  props: DrawerHeaderProps,
  forwardedRef: ForwardedRef<HTMLDivElement>,
): ReactElement {
  const {
    title,
    description,
    avatar,
    action,
    className,
    style,
    sx,
    children,
    ...rest
  } = props;

  const ctx = useDrawerContext('Drawer.Header');

  const { className: headerClass, style: headerStyle } = useThemedClasses({
    recipe: drawerHeaderRecipe,
    componentName: 'Drawer',
    slot: 'header',
    props: {
      size: ctx.size,
      className,
      sx,
      style,
    },
  });

  return (
    <div
      ref={forwardedRef}
      className={headerClass}
      style={headerStyle ?? undefined}
      {...rest}
    >
      {avatar ? <div className="flex-none">{avatar}</div> : null}
      <div className="min-w-0 flex-1">
        {children ?? (
          <>
            {title ? (
              <h2 id={ctx.titleId} className="text-base font-semibold leading-tight text-fg-default">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p
                id={ctx.descId}
                className="mt-1 text-sm leading-snug text-fg-muted"
              >
                {description}
              </p>
            ) : null}
          </>
        )}
      </div>
      {action ? <div className="ms-auto flex-none">{action}</div> : null}
    </div>
  );
}

export const DrawerHeader = forwardRef<HTMLDivElement, DrawerHeaderProps>(DrawerHeaderImpl);
DrawerHeader.displayName = 'Drawer.Header';
