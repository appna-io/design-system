import { Breadcrumbs, Typography } from '@apx-ui/ds';

export default function RenderItem() {
  return (
    <Breadcrumbs
      items={[
        { label: 'Home', href: '#home' },
        { label: 'Workspace', href: '#workspace' },
        { label: 'Issue #42' },
      ]}
      renderItem={({ item, isCurrent, defaultClassName }) =>
        isCurrent ? (
          <Typography as="span" aria-current="page" className={`${defaultClassName} font-semibold`}>
            {item.label}
          </Typography>
        ) : (
          <a href={item.href ?? item.to} className={defaultClassName}>
            {item.label}
          </a>
        )
      }
    />
  );
}