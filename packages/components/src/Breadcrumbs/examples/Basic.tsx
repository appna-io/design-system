import { Breadcrumbs } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '#home' },
        { label: 'Users', href: '#users' },
        { label: 'John Smith', href: '#users-123' },
        { label: 'Settings' },
      ]}
    />
  );
}
