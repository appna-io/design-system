import { Div, Icon, IconProvider, createIconRegistry } from '@apx-ui/ds';
import type { SVGProps } from 'react';

import { Mail } from './_glyphs';

const icons = createIconRegistry({ mail: Mail });

function Fallback(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 9h6v6H9z" />
    </svg>
  );
}

export default function MissingNameFallback() {
  return (
    <IconProvider value={icons} fallback={Fallback} onMissing={() => undefined}>
      <Div display="flex" gap="3" alignItems="center">
        <Icon name="mail" size="lg" label="Mail (registered)" />
        <Icon name="not-registered" size="lg" label="Fallback rendered" />
      </Div>
    </IconProvider>
  );
}