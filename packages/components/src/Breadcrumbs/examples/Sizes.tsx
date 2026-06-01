import { Breadcrumbs, Div, Typography } from '@apx-ui/ds';

const items = [
  { label: 'Home', href: '#home' },
  { label: 'Docs', href: '#docs' },
  { label: 'Guide' },
];

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Div key={size} display="flex" flexDirection="column" gap="1">
          <Typography as="span" variant="caption" color="fg.muted" className="uppercase tracking-wide">
            {size}
          </Typography>
          <Breadcrumbs items={items} size={size} />
        </Div>
      ))}
    </Div>
  );
}