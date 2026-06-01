import { Breadcrumbs, Div, Typography } from '@apx-ui/ds';

const items = [
  { label: 'Home', href: '#home' },
  { label: 'Library', href: '#library' },
  { label: 'Album' },
];

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Div display="flex" flexDirection="column" gap="1">
        <Typography as="span" variant="caption" color="fg.muted" className="uppercase tracking-wide">
          ghost (default)
        </Typography>
        <Breadcrumbs items={items} variant="ghost" />
      </Div>
      <Div display="flex" flexDirection="column" gap="1">
        <Typography as="span" variant="caption" color="fg.muted" className="uppercase tracking-wide">
          soft
        </Typography>
        <Breadcrumbs items={items} variant="soft" color="primary" />
      </Div>
      <Div display="flex" flexDirection="column" gap="1">
        <Typography as="span" variant="caption" color="fg.muted" className="uppercase tracking-wide">
          underline
        </Typography>
        <Breadcrumbs items={items} variant="underline" color="primary" />
      </Div>
    </Div>
  );
}