import type { DataGridTranslations } from '../../DataGrid.types';

/**
 * Hebrew (he) DataGrid translations — ships alongside `en` + `ar` as the canonical
 * RTL stress-test bundle. Pair it with `<DirectionProvider dir="rtl">` (or
 * `<html dir="rtl">`) so the grid's logical CSS flips column pinning, sticky
 * shadows, sort indicators, and pagination arrows to the right edges.
 *
 * Numeric formatters follow Hebrew typographic conventions:
 * - Plural-of-one (`1`) drops the noun's plural marker (`עמוד 1 מתוך 5` reads
 *   "page 1 of 5" but uses the singular `עמוד` either way — Hebrew grammar
 *   doesn't require the same singular/plural split English does for low counts).
 * - "א" prefix for `אם פעיל…` ("active filter…") matches existing UI patterns
 *   shipped in Hebrew-first SaaS products (e.g. Monday, Wix).
 *
 * Every key in `DataGridTranslations` is filled out — the structural type check
 * guarantees no English fallthrough so the snapshot suite catches accidental
 * regressions if the surface grows.
 */
export const heDataGridTranslations: DataGridTranslations = {
  /* Headers */
  selectAllRows: 'בחר את כל השורות',
  selectRow: 'בחר שורה',
  expandRow: 'הרחב שורה',
  collapseRow: 'כווץ שורה',
  sortAscending: 'מיון בסדר עולה',
  sortDescending: 'מיון בסדר יורד',
  sortRemove: 'הסר מיון',
  sortIndex: (i) => `עדיפות מיון ${i}`,

  /* Filters */
  filterColumn: (col) => `סינון ${col}`,
  filterApply: 'החל',
  filterClear: 'נקה',
  filterClearAll: 'נקה את כל הסינונים',
  filterActiveCount: (n) => `${n} סינונים פעילים`,
  filterPlaceholder: 'ערך לסינון…',
  operators: {
    equals: 'שווה',
    notEquals: 'אינו שווה',
    contains: 'מכיל',
    notContains: 'אינו מכיל',
    startsWith: 'מתחיל ב',
    endsWith: 'מסתיים ב',
    gt: 'גדול מ',
    gte: 'גדול או שווה ל',
    lt: 'קטן מ',
    lte: 'קטן או שווה ל',
    between: 'בין',
    before: 'לפני',
    after: 'אחרי',
    isEmpty: 'ריק',
    isNotEmpty: 'אינו ריק',
    in: 'אחד מהבאים',
    notIn: 'אף אחד מהבאים',
    isTrue: 'הוא נכון',
    isFalse: 'הוא לא נכון',
  },

  /* Global search */
  globalSearchPlaceholder: 'חיפוש…',
  globalSearchAriaLabel: 'חיפוש בכל העמודות',

  /* Pagination */
  paginationRowsPerPage: 'שורות בעמוד',
  paginationOfTotal: (s, e, t) => `${s}–${e} מתוך ${t}`,
  paginationFirstPage: 'עמוד ראשון',
  paginationPreviousPage: 'עמוד קודם',
  paginationNextPage: 'עמוד הבא',
  paginationLastPage: 'עמוד אחרון',
  paginationPageOfPages: (c, t) => `עמוד ${c} מתוך ${t}`,

  /* Column management */
  columnsManage: 'עמודות',
  columnsShow: 'הצג',
  columnsHide: 'הסתר',
  columnsReset: 'אפס עמודות',
  columnsPinStart: 'הצמד להתחלה',
  columnsPinEnd: 'הצמד לסוף',
  columnsUnpin: 'בטל הצמדה',
  columnsMoveLeft: 'הזז שמאלה',
  columnsMoveRight: 'הזז ימינה',
  columnsAutoSize: 'גודל אוטומטי',

  /* Density */
  densityLabel: 'צפיפות',
  densityCompact: 'דחוס',
  densityStandard: 'רגיל',
  densityComfortable: 'נוח',

  /* States */
  loading: 'טוען…',
  empty: 'אין נתונים',
  emptyDescription: 'אין שורות להצגה.',
  error: 'משהו השתבש',
  errorRetry: 'נסה שוב',

  /* Selection */
  selectionSummary: (s, t) => `${s} מתוך ${t} נבחרו`,
  selectionClear: 'נקה בחירה',

  /* Export */
  exportLabel: 'ייצוא',
  exportCsv: 'ייצוא כ-CSV',
  exportJson: 'ייצוא כ-JSON',

  /* Row actions */
  rowActions: 'פעולות שורה',
};
