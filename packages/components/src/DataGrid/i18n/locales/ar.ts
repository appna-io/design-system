import type { DataGridTranslations } from '../../DataGrid.types';

/**
 * Arabic (ar) DataGrid translations — second of the two canonical RTL bundles.
 * Pair it with `<DirectionProvider dir="rtl">` so pinning, pagination arrows,
 * and sticky shadows flip to the correct logical edges.
 *
 * Numerals deliberately stay in Western-Arabic (`123…`) form: per `Intl`
 * conventions, most modern Arabic UIs use Western numerals in chrome (only
 * formal Arabic content uses Eastern `٠١٢…`). Consumers wanting Eastern
 * numerals can override `paginationOfTotal` / `selectionSummary` via the
 * `translations` prop without touching the rest of the bundle.
 *
 * Plural rules: Arabic has six plural categories (zero / one / two / few /
 * many / other). We use a single phrasing that reads correctly across all
 * counts for the surface strings DataGrid emits. Consumers who need stricter
 * plural correctness should use `Intl.PluralRules` in their `translations`
 * override.
 */
export const arDataGridTranslations: DataGridTranslations = {
  /* Headers */
  selectAllRows: 'تحديد جميع الصفوف',
  selectRow: 'تحديد الصف',
  expandRow: 'توسيع الصف',
  collapseRow: 'طي الصف',
  sortAscending: 'فرز تصاعدي',
  sortDescending: 'فرز تنازلي',
  sortRemove: 'إزالة الفرز',
  sortIndex: (i) => `أولوية الفرز ${i}`,

  /* Filters */
  filterColumn: (col) => `تصفية ${col}`,
  filterApply: 'تطبيق',
  filterClear: 'مسح',
  filterClearAll: 'مسح كل عوامل التصفية',
  filterActiveCount: (n) => `${n} عوامل تصفية نشطة`,
  filterPlaceholder: 'قيمة التصفية…',
  operators: {
    equals: 'يساوي',
    notEquals: 'لا يساوي',
    contains: 'يحتوي على',
    notContains: 'لا يحتوي على',
    startsWith: 'يبدأ بـ',
    endsWith: 'ينتهي بـ',
    gt: 'أكبر من',
    gte: 'لا يقل عن',
    lt: 'أقل من',
    lte: 'لا يزيد عن',
    between: 'بين',
    before: 'قبل',
    after: 'بعد',
    isEmpty: 'فارغ',
    isNotEmpty: 'غير فارغ',
    in: 'أي من التالي',
    notIn: 'لا شيء مما يلي',
    isTrue: 'صحيح',
    isFalse: 'غير صحيح',
  },

  /* Global search */
  globalSearchPlaceholder: 'بحث…',
  globalSearchAriaLabel: 'بحث في كل الأعمدة',

  /* Pagination */
  paginationRowsPerPage: 'صفوف لكل صفحة',
  paginationOfTotal: (s, e, t) => `${s}–${e} من ${t}`,
  paginationFirstPage: 'الصفحة الأولى',
  paginationPreviousPage: 'الصفحة السابقة',
  paginationNextPage: 'الصفحة التالية',
  paginationLastPage: 'الصفحة الأخيرة',
  paginationPageOfPages: (c, t) => `صفحة ${c} من ${t}`,

  /* Column management */
  columnsManage: 'الأعمدة',
  columnsShow: 'إظهار',
  columnsHide: 'إخفاء',
  columnsReset: 'إعادة تعيين الأعمدة',
  columnsPinStart: 'تثبيت في البداية',
  columnsPinEnd: 'تثبيت في النهاية',
  columnsUnpin: 'إلغاء التثبيت',
  columnsMoveLeft: 'نقل إلى اليسار',
  columnsMoveRight: 'نقل إلى اليمين',
  columnsAutoSize: 'حجم تلقائي',

  /* Density */
  densityLabel: 'الكثافة',
  densityCompact: 'مدمج',
  densityStandard: 'قياسي',
  densityComfortable: 'مريح',

  /* States */
  loading: 'جارٍ التحميل…',
  empty: 'لا توجد بيانات',
  emptyDescription: 'لا توجد صفوف لعرضها.',
  error: 'حدث خطأ ما',
  errorRetry: 'إعادة المحاولة',

  /* Selection */
  selectionSummary: (s, t) => `${s} من ${t} محددة`,
  selectionClear: 'مسح التحديد',

  /* Export */
  exportLabel: 'تصدير',
  exportCsv: 'تصدير كـ CSV',
  exportJson: 'تصدير كـ JSON',

  /* Row actions */
  rowActions: 'إجراءات الصف',
};
