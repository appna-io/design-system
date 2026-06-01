import { DS_ICON_NAMES, Div, Icon, IconProvider, createIconRegistry } from '@apx-ui/ds';

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
      <Div
        className="grid gap-4"
        sx={{ gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}
      >
        {DS_ICON_NAMES.map((n) => (
          <Div key={n} display="flex" alignItems="center" gap="2">
            <Icon name={n} size="md" />
            <code style={{ fontSize: 12 }}>{n}</code>
          </Div>
        ))}
      </Div>
    </IconProvider>
  );
}