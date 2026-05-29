import { Breadcrumbs } from 'apx-ds';

export default function Truncated() {
  return (
    <Breadcrumbs
      maxItems={4}
      items={[
        { label: 'Home', href: '#home' },
        { label: 'Region', href: '#region' },
        { label: 'Country', href: '#country' },
        { label: 'City', href: '#city' },
        { label: 'District', href: '#district' },
        { label: 'Street', href: '#street' },
        { label: 'Address' },
      ]}
    />
  );
}
