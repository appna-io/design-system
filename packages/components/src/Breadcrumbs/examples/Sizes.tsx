import { Breadcrumbs } from 'apx-ds';

const items = [
  { label: 'Home', href: '#home' },
  { label: 'Docs', href: '#docs' },
  { label: 'Guide' },
];

export default function Sizes() {
  return (
    <div className="flex flex-col gap-4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-fg-muted">{size}</span>
          <Breadcrumbs items={items} size={size} />
        </div>
      ))}
    </div>
  );
}
