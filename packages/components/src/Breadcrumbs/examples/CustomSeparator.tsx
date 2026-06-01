import { ChevronRight } from 'lucide-react';
import { Breadcrumbs, Div } from '@apx-ui/ds';

export default function CustomSeparator() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Breadcrumbs
        separator={<ChevronRight aria-hidden="true" className="size-3.5" />}
        items={[
          { label: 'Projects', href: '#projects' },
          { label: 'apx-ds', href: '#apx-ds' },
          { label: 'Pull request #182' },
        ]}
      />
      <Breadcrumbs
        separator="·"
        items={[
          { label: 'Library', href: '#library' },
          { label: 'Albums', href: '#albums' },
          { label: 'Nebula' },
        ]}
      />
    </Div>
  );
}