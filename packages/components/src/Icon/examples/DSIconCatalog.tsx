import { DS_ICON_NAMES, Icon, IconProvider, createIconRegistry } from '@apx-ui/ds';

import * as G from './_glyphs';

const icons = createIconRegistry({
  check: G.Check,
  x: G.X,
  'chevron-up': G.ChevronUp,
  'chevron-down': G.ChevronDown,
  'chevron-left': G.ChevronLeft,
  'chevron-right': G.ChevronRight,
  search: G.Search,
  loader: G.Loader,
  'alert-triangle': G.AlertTriangle,
  info: G.Info,
  star: G.Star,
});

export default function DSIconCatalog() {
  return (
    <IconProvider value={icons} onMissing={() => undefined}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 16 }}>
        {DS_ICON_NAMES.map((n) => (
          <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name={n} size="md" />
            <code style={{ fontSize: 12 }}>{n}</code>
          </div>
        ))}
      </div>
    </IconProvider>
  );
}
