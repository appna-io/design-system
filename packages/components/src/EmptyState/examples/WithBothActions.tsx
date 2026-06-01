import { EmptyState } from '@apx-ui/ds';

export default function WithBothActions() {
  return (
    <EmptyState
      title="No invoices found"
      description="Adjust your filters or browse our documentation for billing setup."
      primaryAction={{
        label: 'Clear filters',
        onClick: () => alert('Filters cleared'),
      }}
      secondaryAction={{
        label: 'Read the docs',
        href: '/docs/billing',
      }}
    />
  );
}