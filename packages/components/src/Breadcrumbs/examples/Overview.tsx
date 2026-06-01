import { Breadcrumbs } from '@apx-ui/ds';

/**
 * Quick-review demo of `<Breadcrumbs />` — a realistic product-detail path showing
 * the array API with linked ancestors and a current-page crumb.
 */
export default function Overview() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '#home' },
        { label: 'Products', href: '#products' },
        { label: 'Wireless Earbuds', href: '#products-earbuds' },
        { label: 'Specifications' },
      ]}
    />
  );
}