import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'pagination',
  displayName: 'Pagination',
  description:
    'Standalone page-navigation primitive. Two modes (page-numbered + cursor), four layouts (full / compact / pages-only / simple), an opt-in page-size Select, window-aware truncation with ellipses, ARIA `nav` + `aria-current="page"`, RTL chevron flipping, and en / he / ar translation bundles via the engine `<I18nProvider>`. Re-used by `<DataGrid.Pagination />` so the two surfaces never drift apart.',
  category: 'Navigation',
  tags: [
    'pagination',
    'navigation',
    'list',
    'cursor',
    'rtl',
    'i18n',
  ],
};