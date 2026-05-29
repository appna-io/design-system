import { Breadcrumbs } from '@apx-ui/ds';

const items = [
  { label: 'Home', href: '#home' },
  { label: 'Library', href: '#library' },
  { label: 'Album' },
];

export default function Variants() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-fg-muted">ghost (default)</span>
        <Breadcrumbs items={items} variant="ghost" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-fg-muted">soft</span>
        <Breadcrumbs items={items} variant="soft" color="primary" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-xs uppercase tracking-wide text-fg-muted">underline</span>
        <Breadcrumbs items={items} variant="underline" color="primary" />
      </div>
    </div>
  );
}
