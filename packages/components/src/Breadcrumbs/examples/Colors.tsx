import { Breadcrumbs, Div, Typography, type BreadcrumbsColor } from '@apx-ui/ds';

const colors: BreadcrumbsColor[] = ['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'neutral'];

const items = [
  { label: 'Home', href: '#home' },
  { label: 'Library', href: '#library' },
  { label: 'Album' },
];

export default function Colors() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      {colors.map((color) => (
        <Div key={color} display="flex" flexDirection="column" gap="1">
          <Typography as="span" variant="caption" color="fg.muted" className="uppercase tracking-wide">
            {color}
          </Typography>
          <Breadcrumbs items={items} variant="soft" color={color} />
        </Div>
      ))}
    </Div>
  );
}