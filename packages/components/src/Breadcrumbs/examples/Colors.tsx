import { Breadcrumbs, type BreadcrumbsColor } from 'apx-ds';

const colors: BreadcrumbsColor[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'];

const items = [
  { label: 'Home', href: '#home' },
  { label: 'Library', href: '#library' },
  { label: 'Album' },
];

export default function Colors() {
  return (
    <div className="flex flex-col gap-4">
      {colors.map((color) => (
        <div key={color} className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-fg-muted">{color}</span>
          <Breadcrumbs items={items} variant="soft" color={color} />
        </div>
      ))}
    </div>
  );
}
