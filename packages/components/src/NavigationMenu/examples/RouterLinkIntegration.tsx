import { forwardRef, type AnchorHTMLAttributes } from 'react';
import { Div, NavigationMenu } from '@apx-ui/ds';

/**
 * Stand-in for a framework router Link (Next.js / React Router / TanStack
 * Router). The key insight: any element that accepts `href`, `className`, and
 * forwards a ref works via `asChild`. NavigationMenu.Link applies its styling
 * + a11y attributes onto the consumer's component, and the consumer retains
 * its routing behavior (client-side transitions, prefetch, etc.).
 */
const RouterLink = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & { to: string }
>(function RouterLink({ to, children, ...rest }, ref) {
  return (
    <a
      ref={ref}
      href={to}
      onClick={(e) => {
        // In a real app this would call your router's navigation API.
        e.preventDefault();
      }}
      data-router-link=""
      {...rest}
    >
      {children}
    </a>
  );
});

export default function RouterLinkIntegration() {
  return (
    <Div className="flex justify-center rounded-md border border-(--sds-color-border-subtle) bg-(--sds-color-surface-default) p-3">
      <NavigationMenu activeHref="/pricing" indicator>
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild>
            <RouterLink to="/features">Features</RouterLink>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild>
            <RouterLink to="/pricing">Pricing</RouterLink>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
        <NavigationMenu.Item>
          <NavigationMenu.Link asChild>
            <RouterLink to="/docs">Docs</RouterLink>
          </NavigationMenu.Link>
        </NavigationMenu.Item>
      </NavigationMenu>
    </Div>
  );
}