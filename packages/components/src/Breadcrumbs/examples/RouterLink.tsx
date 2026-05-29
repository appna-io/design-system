import { Breadcrumbs } from 'apx-ds';

/**
 * Router-flavored breadcrumbs. The `asChild` prop on `<Breadcrumbs.Item>` clones the user's
 * element (an `<a>` here; in real apps swap for Next/Link, React Router's `<Link>`, TanStack
 * Router's `<Link>`, etc.) and merges the recipe className + `aria-current` onto it. The
 * crumb's styling stays consistent and the routing semantics flow through the wrapped element.
 */
export default function RouterLink() {
  return (
    <Breadcrumbs>
      <Breadcrumbs.Item asChild>
        <a href="#home">Home</a>
      </Breadcrumbs.Item>
      <Breadcrumbs.Item asChild>
        <a href="#docs">Docs</a>
      </Breadcrumbs.Item>
      <Breadcrumbs.Item asChild>
        <a href="#docs-routing">Routing</a>
      </Breadcrumbs.Item>
      <Breadcrumbs.Item current>Breadcrumbs</Breadcrumbs.Item>
    </Breadcrumbs>
  );
}
