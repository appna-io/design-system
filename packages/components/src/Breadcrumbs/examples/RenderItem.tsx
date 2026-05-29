import { Breadcrumbs } from 'apx-ds';

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
          <span aria-current="page" className={`${defaultClassName} font-semibold`}>
            {item.label}
          </span>
        ) : (
          <a href={item.href ?? item.to} className={defaultClassName}>
            {item.label}
          </a>
        )
      }
    />
  );
}
