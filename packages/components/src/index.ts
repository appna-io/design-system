export { Accordion } from './Accordion';
export type {
  AccordionColor,
  AccordionContentProps,
  AccordionIconPosition,
  AccordionItemProps,
  AccordionProps,
  AccordionSize,
  AccordionTriggerProps,
  AccordionVariant,
} from './Accordion';

export { Alert } from './Alert';
export type {
  AlertActionProps,
  AlertColor,
  AlertDescriptionProps,
  AlertProps,
  AlertSize,
  AlertTitleProps,
  AlertVariant,
} from './Alert/Alert.types';

export {
  AppShell,
  computeGridTemplate,
  isBelowBreakpoint,
  useAppShell,
  useBreakpointBelow,
} from './AppShell';
export type {
  AppShellBreakpoint,
  AppShellContextValue,
  AppShellHeaderVariant,
  AppShellLayout,
  AppShellMainConfig,
  AppShellMainMaxWidth,
  AppShellMainPadding,
  AppShellProps,
  AppShellSidePosition,
  ComputeGridTemplateArgs,
  GridTemplate,
} from './AppShell';

export { Avatar } from './Avatar/Avatar';
export { AvatarGroup } from './Avatar/AvatarGroup';
export type {
  AvatarProps,
  AvatarGroupProps,
  AvatarVariant,
  AvatarSize,
  AvatarColor,
  AvatarShape,
  AvatarRing,
  AvatarStatus,
  AvatarStatusPlacement,
} from './Avatar/Avatar.types';

export { Badge } from './Badge/Badge';
export type {
  BadgeProps,
  BadgeVariant,
  BadgeSize,
  BadgeColor,
  BadgeShape,
} from './Badge/Badge.types';

export { Breadcrumbs, computeVisibleItems, useBreadcrumbsContext } from './Breadcrumbs';
export type {
  BreadcrumbsColor,
  BreadcrumbsContextValue,
  BreadcrumbsItemData,
  BreadcrumbsItemProps,
  BreadcrumbsProps,
  BreadcrumbsRenderItemContext,
  BreadcrumbsSeparatorColor,
  BreadcrumbsSeparatorProps,
  BreadcrumbsSize,
  BreadcrumbsVariant,
} from './Breadcrumbs';

export { Button } from './Button/Button';
export type { ButtonProps, ButtonVariant, ButtonSize, ButtonColor } from './Button/Button.types';

export { Card } from './Card';
export type {
  CardBodyProps,
  CardColor,
  CardDividerProps,
  CardFooterAlign,
  CardFooterProps,
  CardHeaderProps,
  CardMediaProps,
  CardOrientation,
  CardProps,
  CardShape,
  CardSize,
  CardVariant,
} from './Card';

export {
  Carousel,
  CarouselContext,
  clampIndex,
  computeSlideStep,
  computeSlideTarget,
  useCarouselContext,
} from './Carousel';
export type {
  CarouselAlign,
  CarouselAutoplayControlProps,
  CarouselAutoplayDirection,
  CarouselBaseProps,
  CarouselButtonProps,
  CarouselChangeSource,
  CarouselContextValue,
  CarouselControlsProps,
  CarouselIndicatorProps,
  CarouselIndicatorVariant,
  CarouselIndicatorsProps,
  CarouselLivePoliteness,
  CarouselLiveRegionProps,
  CarouselOrientation,
  CarouselProps,
  CarouselRef,
  CarouselShowMode,
  CarouselSize,
  CarouselSlideProps,
  CarouselSnap,
  CarouselTrackProps,
  CarouselVariant,
  CarouselViewportProps,
} from './Carousel';

export { Checkbox } from './Checkbox/Checkbox';
export type {
  CheckboxProps,
  CheckboxVariant,
  CheckboxSize,
  CheckboxColor,
  CheckboxShape,
  CheckboxLabelPosition,
} from './Checkbox/Checkbox.types';

export {
  Combobox,
  MultiCombobox,
  DEFAULT_COMBOBOX_TRANSLATIONS,
  flattenOptions,
  filterStrategies,
  fuzzyMatch,
  highlightMatch,
  useDeferredFilter,
} from './Combobox';
export type {
  ComboboxColor,
  ComboboxCreateItemRecord,
  ComboboxGroup,
  ComboboxItemRecord,
  ComboboxListItem,
  ComboboxListProps,
  ComboboxLoadingState,
  ComboboxMatchStrategy,
  ComboboxMode,
  ComboboxOption,
  ComboboxOptionOrGroup,
  ComboboxPlacement,
  ComboboxProps,
  ComboboxRenderOptionContext,
  ComboboxSize,
  ComboboxTranslations,
  ComboboxVariant,
  FilterStrategyFn,
  FlattenedOptions,
  MultiComboboxProps,
  UseDeferredFilterOptions,
  UseDeferredFilterReturn,
} from './Combobox';

export {
  CommandPalette,
  Kbd,
  commands,
  palette,
  useRegisterCommand,
  useGlobalHotkey,
  parseHotkey,
  matchesHotkey,
  resolveMod,
  detectHotkeyPlatform,
  macKey,
  filterCommands,
  flattenSections,
  groupByCategory,
  DEFAULT_COMMAND_PALETTE_TRANSLATIONS,
} from './CommandPalette';
export type {
  Command,
  CommandContext,
  CommandPaletteColor,
  CommandPalettePage,
  CommandPaletteProps,
  CommandPaletteSize,
  CommandPaletteTranslations,
  CommandPaletteVariant,
  CommandSection,
  FilterCommandsOptions,
  HotkeyPlatform,
  KbdProps,
  ParsedHotkey,
  PaletteState,
  RenderCommandContext,
  UseGlobalHotkeyOptions,
} from './CommandPalette';

export {
  ColorPicker,
  ColorSwatch,
  ColorInput,
  colorPickerRecipes,
  contrastRatio as colorPickerContrastRatio,
  detectFormat as colorPickerDetectFormat,
  formatColor as colorPickerFormatColor,
  hslaToRgba as colorPickerHslaToRgba,
  hsvaToRgba as colorPickerHsvaToRgba,
  parseColor as colorPickerParseColor,
  rgbaEquals as colorPickerRgbaEquals,
  rgbaToHsla as colorPickerRgbaToHsla,
  rgbaToHsva as colorPickerRgbaToHsva,
  relativeLuminance as colorPickerRelativeLuminance,
  wcagLevel as colorPickerWcagLevel,
  enColorPickerTranslations,
  heColorPickerTranslations,
  arColorPickerTranslations,
  mergeColorPickerTranslations,
  useColorPickerTranslations,
} from './ColorPicker';
export type {
  ColorFormat,
  ColorInputProps,
  ColorPickerChangeHandler,
  ColorPickerChangeMeta,
  ColorPickerChangeSource,
  ColorPickerFormat,
  ColorPickerProps,
  ColorPickerSize,
  ColorPickerTranslations,
  ColorPickerTriggerVariant,
  ColorSwatchProps,
  HSLA as ColorPickerHSLA,
  HSVA as ColorPickerHSVA,
  RGBA as ColorPickerRGBA,
  WcagLevel as ColorPickerWcagLevel,
} from './ColorPicker';

export { Divider } from './Divider';
export type {
  DividerColor,
  DividerLabelPosition,
  DividerOrientation,
  DividerProps,
  DividerThickness,
  DividerVariant,
} from './Divider';

export {
  Div,
  divRecipe,
  extractStyleProps,
  STYLE_PROP_KEYS,
  buildPseudoClassName,
  PSEUDO_PREFIX,
} from './Div';
export type {
  DivAnimation,
  DivBreakpoint,
  DivOwnProps,
  DivProps,
  DivPseudoProps,
  DivPseudoState,
  DivStyleProps,
  ExtractStylePropsResult as DivExtractStylePropsResult,
  PseudoPropMap as DivPseudoPropMap,
  PseudoPropName as DivPseudoPropName,
} from './Div';

/* DataGrid — Phase 27. PR 2 shipped the headless `useDataGrid()` layer; PR 3 added the
 * high-level `<DataGrid />` component + compound subparts (Root / Table / Header /
 * HeaderCell / Body / Row / Cell); PR 4 added the toolbar, pagination, selection bar,
 * structural columns, filter UX, density toggle, column-visibility toggle, and export
 * menu. PR 5 layered in column pinning + drag-to-resize + row expansion + double-click
 * cell editing + sticky aggregations footer + canonical loading / empty / error states.
 * PR 6 added opt-in row virtualization via `<DataGrid.VirtualBody>` (peer dep on
 * `@tanstack/react-virtual`). PR 7 shipped Hebrew + Arabic translation bundles, the
 * `column.responsive.hideBelow` media-query bridge, and `storage="local" | "session" |
 * StorageAdapter` persistence (selection + pageIndex deliberately excluded). PR 8
 * closes out with the full a11y matrix sweep, performance benchmarks, and the README. */
export {
  AGGREGATION_LABELS,
  applyOperator,
  avg as dataGridAvg,
  BUILT_IN_AGGREGATORS,
  clampCoord,
  compareValues,
  computePinningOffsets,
  coordEquals,
  count as dataGridCount,
  countDistinct as dataGridCountDistinct,
  dataGridActionsCellRecipe,
  dataGridCellEditorRecipe,
  dataGridEmptyRowRecipe,
  dataGridErrorRowRecipe,
  dataGridExpansionCellRecipe,
  dataGridExpansionRowRecipe,
  dataGridFilterButtonRecipe,
  dataGridFilterPanelRecipe,
  dataGridLoadingOverlayRecipe,
  dataGridMotion,
  dataGridPaginationRecipe,
  dataGridResizeHandleRecipe,
  dataGridRootRecipe,
  dataGridScrollerRecipe,
  dataGridSelectCellRecipe,
  dataGridSelectionBarRecipe,
  dataGridSortButtonRecipe,
  dataGridTableRecipe,
  dataGridTbodyRecipe,
  dataGridTdRecipe,
  dataGridTfootCellRecipe,
  dataGridTfootRecipe,
  dataGridTheadRecipe,
  dataGridThRecipe,
  dataGridToolbarRecipe,
  dataGridTransition,
  dataGridTrRecipe,
  DataGrid,
  DataGridActionsBodyCell,
  DataGridActionsHeaderCell,
  DataGridBody,
  DataGridCell,
  DataGridCellEditor,
  DataGridColumnMenu,
  DataGridColumnVisibility,
  DataGridContext,
  DataGridDensitySelect,
  DataGridEmpty,
  DataGridError,
  DataGridExpandBodyCell,
  DataGridExpandHeaderCell,
  DataGridExpansionRow,
  DataGridExport,
  DataGridFilterButton,
  DataGridFilterPanel,
  DataGridFocusProvider,
  DataGridFooter,
  DataGridGlobalSearch,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridLoading,
  DataGridPagination,
  DataGridResizeHandle,
  DataGridRoot,
  DataGridRow,
  DataGridSelectBodyCell,
  DataGridSelectHeaderCell,
  DataGridSelectionBar,
  DataGridTable,
  DataGridToolbar,
  DataGridVirtualBody,
  DEFAULT_DATAGRID_TRANSLATIONS,
  deriveColumnOrder,
  deriveFilteredRows,
  derivePaginatedRows,
  derivePinnedColumns,
  deriveSortedRows,
  deriveVisibleColumns,
  enDataGridTranslations,
  exportCsv as exportDataGridCsv,
  exportJson as exportDataGridJson,
  FILTER_OPERATORS,
  formatAggregatedValue,
  getCellValue,
  isCustomAggregation,
  isStructuralColumn,
  isStructuralType,
  max as dataGridMax,
  median as dataGridMedian,
  mergeTranslations as mergeDataGridTranslations,
  min as dataGridMin,
  nextFocusCoord,
  runAggregation,
  runColumnAggregations,
  sum as dataGridSum,
  useCellRef,
  useDataGrid,
  useDataGridContext,
  useDataGridFocus,
  useDataGridTranslations,
  VALUELESS_OPERATORS,
  /* PR 7 — RTL stress-test locale bundles, the `column.responsive.hideBelow`
   * media-query bridge, and the Tailwind breakpoint pixel table the bridge
   * mirrors. The persistence layer (`storage` / `storageKey`) is already on
   * `<DataGrid>` via the headless hook from PR 2. */
  arDataGridTranslations,
  heDataGridTranslations,
  RESPONSIVE_BREAKPOINT_PX,
  useResponsiveColumns,
} from './DataGrid';
export type {
  AggregationId as DataGridAggregationId,
  CellContext as DataGridCellContext,
  CellCoord as DataGridCellCoord,
  CellEditorContext as DataGridCellEditorContext,
  ColumnAggregation as DataGridColumnAggregation,
  ColumnDef as DataGridColumnDef,
  ColumnFilter as DataGridColumnFilter,
  ColumnFiltersState as DataGridColumnFiltersState,
  ColumnId as DataGridColumnId,
  ColumnPinningState as DataGridColumnPinningState,
  ColumnType as DataGridColumnType,
  CursorPagination as DataGridCursorPagination,
  CustomAggregation as DataGridCustomAggregation,
  DataGridActionsBodyCellProps,
  DataGridActionsHeaderCellProps,
  DataGridBodyProps,
  DataGridCellEditorProps,
  DataGridCellProps,
  DataGridColor,
  DataGridColumnMenuProps,
  DataGridColumnVisibilityProps,
  DataGridContextValue,
  DataGridDensity,
  DataGridDensitySelectProps,
  DataGridElevation,
  DataGridEmptyProps,
  DataGridErrorProps,
  DataGridExpandBodyCellProps,
  DataGridExpandHeaderCellProps,
  DataGridExpansionRowProps,
  DataGridExportProps,
  DataGridFilterButtonProps,
  DataGridFilterPanelProps,
  DataGridFooterProps,
  DataGridGlobalSearchProps,
  DataGridHeaderCellProps,
  DataGridHeaderProps,
  DataGridLoadingProps,
  DataGridOperatorTranslations,
  DataGridPaginationProps,
  DataGridProps,
  DataGridResizeHandleProps,
  DataGridRootProps,
  DataGridRoundedCorners,
  DataGridRowAction,
  DataGridRowProps,
  DataGridSelectBodyCellProps,
  DataGridSelectHeaderCellProps,
  DataGridSelectionBarProps,
  DataGridState,
  DataGridTableProps,
  DataGridToolbarProps,
  DataGridTranslations,
  DataGridVariant,
  DataGridVirtualBodyProps,
  FilterContext as DataGridFilterContext,
  FilterOperator as DataGridFilterOperator,
  FilterValue as DataGridFilterValue,
  HeaderContext as DataGridHeaderContext,
  KeyboardNavOptions as DataGridKeyboardNavOptions,
  OffsetPagination as DataGridOffsetPagination,
  PaginationState as DataGridPaginationState,
  PersistedDataGridState,
  ResponsiveBreakpointKey as DataGridResponsiveBreakpointKey,
  Row as DataGridRowData,
  RowId as DataGridRowId,
  SelectionIds as DataGridSelectionIds,
  SelectionMode as DataGridSelectionMode,
  SelectionState as DataGridSelectionState,
  SortDescriptor as DataGridSortDescriptor,
  SortDirection as DataGridSortDirection,
  StorageAdapter as DataGridStorageAdapter,
  StorageKind as DataGridStorageKind,
  UseDataGridOptions,
  UseDataGridReturn,
} from './DataGrid';

export { Drawer } from './Drawer';
export type {
  DrawerBodyProps,
  DrawerCloseProps,
  DrawerContentProps,
  DrawerFooterAlign,
  DrawerFooterProps,
  DrawerHeaderProps,
  DrawerOverlay,
  DrawerProps,
  DrawerSide,
  DrawerSize,
  DrawerTriggerProps,
} from './Drawer';

export { EmptyState } from './EmptyState';
export type {
  EmptyStateActionShortcut,
  EmptyStateActionsProps,
  EmptyStateAlign,
  EmptyStateContextValue,
  EmptyStateDescriptionProps,
  EmptyStateIconProps,
  EmptyStateIllustrationProps,
  EmptyStateProps,
  EmptyStateSize,
  EmptyStateTitleProps,
  EmptyStateVariant,
} from './EmptyState';

export { Field, FieldContext, useFieldContext, useFieldIds } from './Field';
export type {
  FieldAs,
  FieldBaseProps,
  FieldContextValue,
  FieldControlProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldHelperProps,
  FieldLabelPosition,
  FieldLabelProps,
  FieldProps,
  FieldSize,
  UseFieldIdsOptions,
  UseFieldIdsReturn,
} from './Field';

export {
  Dropzone,
  FileUpload,
  DEFAULT_FILE_UPLOAD_TRANSLATIONS,
  fileUploadRecipes,
  formatBytes,
  matchAccept,
  normalizeAccept,
  useDropzone,
  useFileUpload,
  usePasteFiles,
  useUploadQueue,
  validateFile,
} from './FileUpload';
export type {
  DropzoneProps,
  DropzoneRenderProps,
  FileRejection,
  FileRejectionReason,
  FileUploadColor,
  FileUploadContext,
  FileUploadFn,
  FileUploadOrientation,
  FileUploadProps,
  FileUploadSize,
  FileUploadStatus,
  FileUploadTranslations,
  FileUploadValidator,
  FileUploadVariant,
  FileWithProgress,
  UseDropzoneOptions,
  UseDropzoneReturn,
  UseFileUploadOptions,
  UseFileUploadReturn,
} from './FileUpload';

export {
  Form,
  FormContext,
  FormField,
  FormProvider,
  deriveDirty,
  deriveErrors,
  formReducer,
  formRecipe,
  initialFormState,
  parseEventValue,
  useForm,
  useFormContext,
} from './Form';
export type {
  FieldValidator,
  FormAction,
  FormApi,
  FormErrors,
  FormFieldBinding,
  FormFieldProps,
  FormFlags,
  FormHelpers,
  FormProps,
  FormState,
  FormValidator,
  UseFormOptions,
  ValidateOn,
} from './Form';

export { HoverCard } from './HoverCard';
export type {
  HoverCardArrowProps,
  HoverCardColor,
  HoverCardContentProps,
  HoverCardContextValue,
  HoverCardPlacement,
  HoverCardProps,
  HoverCardSize,
  HoverCardTriggerMode,
  HoverCardTriggerProps,
  HoverCardVariant,
} from './HoverCard';

export {
  Icon,
  IconProvider,
  createIconRegistry,
  EMPTY_ICON_REGISTRY,
  useIconRegistry,
  DS_ICON_NAMES,
  resolveIconA11y,
  resolveIconSize,
  resolveIconColor,
  isIconSizeToken,
  isIconColorToken,
} from './Icon';
export type {
  CreateIconRegistryOptions,
  DSIconName,
  IconColor,
  IconColorToken,
  IconComponent,
  IconFlip,
  IconProps,
  IconProviderProps,
  IconRegistry,
  IconRegistrySource,
  IconRotate,
  IconSize,
  IconSizeToken,
  IconVariant,
  ResolveIconA11yInput,
  ResolveIconA11yOutput,
  ResolvedIconColor,
  ResolvedIconSize,
  UseIconRegistryReturn,
} from './Icon';

export { Input } from './Input/Input';
export type { InputProps, InputVariant, InputSize, InputColor } from './Input/Input.types';

export { Menu } from './Menu';
export type {
  MenuCheckboxItemProps,
  MenuColor,
  MenuContentProps,
  MenuGroupProps,
  MenuItemColor,
  MenuItemProps,
  MenuLabelProps,
  MenuPlacement,
  MenuProps,
  MenuRadioGroupProps,
  MenuRadioItemProps,
  MenuSeparatorProps,
  MenuSize,
  MenuSubContentProps,
  MenuSubProps,
  MenuSubTriggerProps,
  MenuTriggerKind,
  MenuTriggerProps,
  MenuVariant,
} from './Menu';

export { Modal } from './Modal';
export type {
  ModalBodyProps,
  ModalCloseProps,
  ModalContentProps,
  ModalFooterAlign,
  ModalFooterProps,
  ModalHeaderProps,
  ModalOverlay,
  ModalPlacement,
  ModalProps,
  ModalSize,
  ModalTriggerProps,
  ModalVariant,
} from './Modal';

export {
  AR_NAVIGATION_MENU_TRANSLATIONS,
  DEFAULT_NAVIGATION_MENU_TRANSLATIONS,
  HE_NAVIGATION_MENU_TRANSLATIONS,
  mergeNavigationMenuTranslations,
  NavigationMenu,
  navMenuChevronRecipe,
  navMenuContentRecipe,
  navMenuFeaturedRecipe,
  navMenuGroupLabelRecipe,
  navMenuGroupRecipe,
  navMenuIndicatorRecipe,
  navMenuItemRecipe,
  navMenuMegaRecipe,
  navMenuPanelLinkRecipe,
  navMenuRootRecipe,
  navMenuTriggerRecipe,
} from './NavigationMenu';
export type {
  NavigationMenuActiveMatchStrategy,
  NavigationMenuColumns,
  NavigationMenuContentProps,
  NavigationMenuContentVariant,
  NavigationMenuContextValue,
  NavigationMenuFeaturedProps,
  NavigationMenuGroupProps,
  NavigationMenuIndicatorProps,
  NavigationMenuIndicatorVariant,
  NavigationMenuItemProps,
  NavigationMenuItemRecord,
  NavigationMenuLinkProps,
  NavigationMenuMobileBreakpoint,
  NavigationMenuOrientation,
  NavigationMenuProps,
  NavigationMenuSize,
  NavigationMenuTranslations,
  NavigationMenuTriggerMode,
  NavigationMenuTriggerProps,
  NavigationMenuVariant,
} from './NavigationMenu';

export { NumberInput } from './NumberInput';
export type {
  NumberInputColor,
  NumberInputProps,
  NumberInputSize,
  NumberInputVariant,
  StepperPosition,
} from './NumberInput';

export { Popover } from './Popover';
export type {
  PopoverArrowProps,
  PopoverCloseProps,
  PopoverColor,
  PopoverContentProps,
  PopoverPlacement,
  PopoverProps,
  PopoverSize,
  PopoverTriggerProps,
  PopoverVariant,
} from './Popover';

/* Phase 31 — `<Pagination />`. Headless layer + pure window helper shipped in
 * PR 1; the full DOM component, slot recipes, i18n bundles (en/he/ar), and
 * translation hook ship in PR 2; `<DataGrid.Pagination />` is delegated to
 * this component in PR 3 so the two surfaces never drift apart. */
export {
  Pagination,
  arPaginationTranslations,
  computePageWindow,
  enPaginationTranslations,
  hePaginationTranslations,
  mergePaginationTranslations,
  paginationButtonRecipe,
  paginationDefaultTranslations,
  paginationEllipsisRecipe,
  paginationListRecipe,
  paginationMeta,
  paginationRangeLabelRecipe,
  paginationRootRecipe,
  paginationSizePickerRecipe,
  usePagination,
  usePaginationTranslations,
} from './Pagination';
export type {
  ComputePageWindowOptions,
  PageItem,
  PaginationChange,
  PaginationColor,
  PaginationLayout,
  PaginationMode,
  PaginationProps,
  PaginationShape,
  PaginationSize,
  PaginationTranslations,
  PaginationVariant,
  UsePaginationOptions,
  UsePaginationReturn,
} from './Pagination';

export { Progress } from './Progress/Progress';
export { CircularProgress } from './Progress/CircularProgress';
export type {
  ProgressProps,
  ProgressVariant,
  ProgressSize,
  ProgressColor,
  ProgressRounded,
  ProgressLabelFormatter,
  CircularProgressProps,
  CircularProgressVariant,
} from './Progress/Progress.types';

export { Radio, RadioGroup, useRadioGroup } from './Radio';
export type {
  RadioColor,
  RadioGroupContextValue,
  RadioGroupOrientation,
  RadioGroupProps,
  RadioLabelPosition,
  RadioProps,
  RadioSize,
  RadioVariant,
} from './Radio';

export {
  Rating,
  DEFAULT_VALUE_FORMATTER as RATING_DEFAULT_VALUE_FORMATTER,
  ratingFillFraction,
  ratingValueFromPointer,
  useRatingKeyboard,
} from './Rating';
export type {
  RatingChangeHandler,
  RatingChangeMeta,
  RatingChangeSource,
  RatingColor,
  RatingPointerArgs,
  RatingPrecision,
  RatingProps,
  RatingSize,
  RatingValueFormatter,
  UseRatingKeyboardArgs,
} from './Rating';

/* Calendar — Phase 33. The canonical date primitive — headless `useCalendar` hook +
 * DOM `<Calendar>` root with single / multiple / range modes, ARIA grid + roving
 * tabindex, the full W3C Date Picker Dialog keyboard map, locale-aware weekday + month
 * names + first-day-of-week (driven by `Intl.Locale.weekInfo` with a fallback table),
 * RTL via logical CSS, `min` / `max` / `isDateDisabled` constraints, week-number gutter,
 * fixed-week layout, custom day / weekday / header renderers, and 12 pure date helpers
 * (~150 LoC, no external date library). Powers `<DatePicker>`, `<DateRangePicker>`, and
 * (in a follow-up refactor) the Scheduler's mini-month + viewport date math. */
export {
  Calendar,
  useCalendar,
  useCalendarKeyboard,
  useCalendarContext,
  useOptionalCalendarContext,
  CalendarContext,
  DEFAULT_CALENDAR_TRANSLATIONS,
  mergeCalendarTranslations,
  /* recipes */
  calendarRootRecipe,
  calendarHeaderRecipe,
  calendarHeaderTitleRecipe,
  calendarNavButtonRecipe,
  calendarMonthsRowRecipe,
  calendarMonthRecipe,
  calendarWeekdaysRowRecipe,
  calendarWeekdayRecipe,
  calendarWeeksGridRecipe,
  calendarWeekNumberCellRecipe,
  calendarDayRecipe,
  datePickerTriggerRecipe,
  datePickerPresetListRecipe,
  datePickerPresetItemRecipe,
  datePickerApplyBarRecipe,
  datePickerPopoverContentRecipe,
  /* helpers — re-exported under aliased names since the Scheduler already exports
   *   the same names from its local `dateMath` copy. The Calendar copies are the
   *   canonical home; the Scheduler aliases will move to re-exports of these in a
   *   follow-up refactor. */
  addDays as calendarAddDays,
  addMonths as calendarAddMonths,
  addYears as calendarAddYears,
  clampDate,
  computeMonthGrid as calendarComputeMonthGrid,
  formatDate,
  formatIsoDate,
  getFirstDayOfWeek,
  getMonthName as calendarGetMonthName,
  getMonthYearTitle as calendarGetMonthYearTitle,
  getLongDayLabel as calendarGetLongDayLabel,
  getWeekdayNames as calendarGetWeekdayNames,
  isoWeekNumber as calendarIsoWeekNumber,
  parseDateFormat,
  parseIsoDate,
  startOfMonth as calendarStartOfMonth,
} from './Calendar';
export type {
  CalendarColor,
  CalendarContextValue,
  CalendarDay,
  CalendarDayState,
  CalendarMode,
  CalendarProps,
  CalendarSize,
  CalendarTranslations,
  CalendarValue,
  CalendarVariant,
  DateRange,
  RenderCalendarDayContext,
  RenderCalendarHeaderContext,
  RenderCalendarWeekdayContext,
  UseCalendarOptions,
  UseCalendarReturn,
  Weekday,
} from './Calendar';

/* DatePicker + DateRangePicker — Phase 33 (companion to `<Calendar>`). Compose `<Input>` +
 * `<Popover>` + `<Calendar>` with typed-input parsing (permissive TR 35 token set),
 * presets, clearable + hidden ISO-8601 form field, and locale-aware first-day-of-week.
 * `<DateRangePicker>` is the two-month sibling with paired typed inputs and a preset
 * rail (e.g. "Last 7 days"). */
export { DatePicker, DateRangePicker } from './DatePicker';
export type {
  DatePickerPreset,
  DatePickerProps,
  DateRangePickerPreset,
  DateRangePickerProps,
  PickerMode,
  PickerPopoverOptions,
} from './DatePicker';

/* Scheduler — Phase 58. PR 1 ships the headless `useScheduler` hook, all 10 pure helpers
 * (`dateMath` / `eventLayout` / `recurrence` / `holidays` / `dragMath` / `viewportRange`
 * / `splitAtMidnight` / `findConflicts` / `eventColor` / `formatTime`), the high-level
 * `<Scheduler />` root, compound subparts (`Toolbar` / `EventCard` / `NowIndicator` /
 * `TimeAxis` / `HolidayBanner` / `QuickPopover`), and 4 of 8 views (Month / TimeGrid for
 * week+workWeek+day+multiDay / Agenda). Resource swimlane + Year heatmap stubs render
 * a clear "coming soon" placeholder. Drag-to-create with snap-to-grid + quick-popover
 * already work end-to-end. PR 2 wires up the full event editor modal, the Filters
 * sidebar, the MiniMonth nav, the Resource swimlane renderer, the Year heatmap, and
 * the drag-move / drag-resize commit path. See plan §"Suggested PR split". */
export {
  Scheduler,
  useScheduler,
  useSchedulerContext,
  useOptionalSchedulerContext,
  SchedulerContext,
  DEFAULT_SCHEDULER_TRANSLATIONS,
  mergeSchedulerTranslations,
  resolveDefaultHourHeight,
  /* helpers */
  addDays as schedulerAddDays,
  addMinutes as schedulerAddMinutes,
  addMonths as schedulerAddMonths,
  computeMonthGrid as schedulerComputeMonthGrid,
  eachDayInRange as schedulerEachDayInRange,
  expandRecurrence as schedulerExpandRecurrence,
  findConflicts as schedulerFindConflicts,
  formatRangeTitle as schedulerFormatRangeTitle,
  formatTime as schedulerFormatTime,
  getBuiltInHolidays as schedulerGetBuiltInHolidays,
  layoutAllDayEvents as schedulerLayoutAllDayEvents,
  layoutTimedEvents as schedulerLayoutTimedEvents,
  shiftAnchor as schedulerShiftAnchor,
  startOfDay as schedulerStartOfDay,
  startOfWeek as schedulerStartOfWeek,
  toDayKey as schedulerToDayKey,
  viewportRange as schedulerViewportRange,
  /* recipes */
  schedulerEventRecipe,
  schedulerMonthCellRecipe,
  schedulerRootRecipe,
  schedulerToolbarRecipe,
} from './Scheduler';
export type {
  Attendee as SchedulerAttendee,
  CalendarSource as SchedulerCalendarSource,
  ConflictInfo as SchedulerConflictInfo,
  EventMoveChange as SchedulerEventMoveChange,
  EventResizeChange as SchedulerEventResizeChange,
  Holiday as SchedulerHoliday,
  NewEventDraft as SchedulerNewEventDraft,
  PositionedEvent as SchedulerPositionedEvent,
  RecurrenceRule as SchedulerRecurrenceRule,
  Reminder as SchedulerReminder,
  Resource as SchedulerResource,
  ResourceGroup as SchedulerResourceGroup,
  SchedulerColor,
  SchedulerContextValue,
  SchedulerDensity,
  SchedulerDragState,
  SchedulerError,
  SchedulerEvent,
  SchedulerEventCardProps,
  SchedulerEventShape,
  SchedulerFilters,
  SchedulerHolidayBannerProps,
  SchedulerNowIndicatorProps,
  SchedulerNowIndicatorStyle,
  SchedulerProps,
  SchedulerQuickPopoverProps,
  SchedulerSelectionState,
  SchedulerSize,
  SchedulerState,
  SchedulerStorageAdapter,
  SchedulerStorageKind,
  SchedulerTimeFormat,
  SchedulerToolbarProps,
  SchedulerTranslations,
  SchedulerVariant,
  SchedulerView,
  TimeGridViewProps as SchedulerTimeGridViewProps,
  UseSchedulerOptions,
  UseSchedulerReturn,
  Weekday as SchedulerWeekday,
} from './Scheduler';

export { Select } from './Select';
export type {
  SelectColor,
  SelectContentProps,
  SelectContentVariant,
  SelectGroupProps,
  SelectItemIndicatorProps,
  SelectItemProps,
  SelectLabelProps,
  SelectPlacement,
  SelectProps,
  SelectSeparatorProps,
  SelectSize,
  SelectTriggerProps,
  SelectVariant,
} from './Select';

export { Sidebar, isActiveHref } from './Sidebar';
export type {
  SidebarActiveMatchStrategy,
  SidebarContextValue,
  SidebarFooterProps,
  SidebarHeaderProps,
  SidebarItemProps,
  SidebarItemSize,
  SidebarItemVariant,
  SidebarPosition,
  SidebarProps,
  SidebarSectionProps,
  SidebarSize,
  SidebarSpacerProps,
  SidebarSubItemsProps,
  SidebarVariant,
} from './Sidebar';

export { Skeleton } from './Skeleton/Skeleton';
export { SkeletonText } from './Skeleton/SkeletonText';
export { SkeletonAvatar } from './Skeleton/SkeletonAvatar';
export type {
  SkeletonProps,
  SkeletonTextProps,
  SkeletonAvatarProps,
  SkeletonVariant,
  SkeletonAnimation,
  SkeletonRounded,
  SkeletonColor,
  SkeletonAvatarSize,
} from './Skeleton/Skeleton.types';

export { Slider } from './Slider/Slider';
export type {
  SliderProps,
  SliderVariant,
  SliderSize,
  SliderColor,
  SliderOrientation,
  SliderMode,
  SliderValue,
  SliderMark,
  SliderValueLabelMode,
} from './Slider/Slider.types';

export { Spinner, SPINNER_SIZE_PX, SPINNER_SPEED_MS } from './Spinner/Spinner';
export type {
  SpinnerColor,
  SpinnerLabelPlacement,
  SpinnerProps,
  SpinnerSize,
  SpinnerSpeed,
  SpinnerThickness,
  SpinnerVariant,
} from './Spinner/Spinner.types';

export { Stack, HStack, VStack, Spacer } from './Stack';
export type {
  HVStackProps,
  SpacerAxis,
  SpacerProps,
  SpacerSize,
  StackAlign,
  StackAs,
  StackDirection,
  StackGap,
  StackJustify,
  StackProps,
  StackWrap,
} from './Stack';

export { Stat, StatGroup, formatValue, deltaPresentation } from './Stat';
export type {
  StatProps,
  StatGroupProps,
  StatVariant,
  StatSize,
  StatAlign,
  StatColorize,
  StatFormat,
  StatDelta,
  StatDeltaDirection,
  StatGroupDirection,
  StatSubcomponentProps,
  StatDeltaSubcomponentProps,
  StatContextValue,
  FormatValueOptions,
  DeltaPresentation,
  StatDeltaTone,
  StatDeltaArrow,
} from './Stat';

export {
  Stepper,
  isStepClickable,
  resolveConnectorStatus,
  resolveStepStatus,
  useStepperContext,
} from './Stepper';
export type {
  StepData,
  StepperAlign,
  StepperClickInfo,
  StepperClickable,
  StepperContextValue,
  StepperOrientation,
  StepperProps,
  StepperSize,
  StepperStepProps,
  StepperVariant,
  StepStatus,
} from './Stepper';

export { Switch } from './Switch/Switch';
export type {
  SwitchProps,
  SwitchVariant,
  SwitchSize,
  SwitchColor,
  SwitchShape,
  SwitchLabelPosition,
  SwitchThumbIcon,
} from './Switch/Switch.types';

export { Table, sortRows, cycleSort } from './Table';
export type {
  TableProps,
  TableColumn,
  TableSortState,
  TableSortDirection,
  TableSortFn,
  TableSelectionMode,
  TableVariant,
  TableDensity,
  TableCellAlign,
  TableRowProps,
  TableCellProps,
  TableHeaderCellProps,
  TableCaptionProps,
  TableSubcomponentProps,
  TableContextValue,
} from './Table';

export { Tabs, useTabsContext } from './Tabs';
export type {
  TabsActivation,
  TabsAlignment,
  TabsColor,
  TabsContextValue,
  TabsListProps,
  TabsOrientation,
  TabsPanelProps,
  TabsProps,
  TabsSize,
  TabsTriggerProps,
  TabsVariant,
} from './Tabs';

export {
  TagsInput,
  DEFAULT_TAGS_INPUT_TRANSLATIONS,
  splitTokens,
  containsSeparator,
  normalizeTag,
} from './TagsInput';
export type {
  NormalizedTag,
  NormalizeOptions,
  TagsInputAddSource,
  TagsInputChangeHandler,
  TagsInputChangeMeta,
  TagsInputProps,
  TagsInputRemoveSource,
  TagsInputRenderSuggestion,
  TagsInputRenderTag,
  TagsInputRenderTagContext,
  TagsInputSize,
  TagsInputTagSize,
  TagsInputTranslations,
  TagsInputValidator,
  TagsInputVariant,
} from './TagsInput';

export { Textarea } from './Textarea/Textarea';
export type {
  TextareaProps,
  TextareaVariant,
  TextareaSize,
  TextareaColor,
  TextareaResize,
} from './Textarea/Textarea.types';

export { Timeline, formatTimestamp } from './Timeline';
export type {
  TimelineProps,
  TimelineItemProps,
  TimelineItemData,
  TimelineOrientation,
  TimelineLayout,
  TimelineSize,
  TimelineTone,
  TimelineTimestampFormat,
  TimelineSubcomponentProps,
  TimelineContextValue,
  TimelineItemContextValue,
  FormatTimestampOptions,
  FormattedTimestamp,
} from './Timeline';

export { Toaster, Toast, toast } from './Toast';
export type {
  ToastApi,
  ToastButton,
  ToastIntent,
  ToastOptions,
  ToastPosition,
  ToastPromiseMessages,
  ToastProps,
  ToastVariant,
  ToasterProps,
} from './Toast';

export { Toggle, ToggleGroup } from './Toggle';
export type {
  ToggleColor,
  ToggleGroupItemProps,
  ToggleGroupProps,
  ToggleOrientation,
  ToggleProps,
  ToggleSize,
  ToggleVariant,
} from './Toggle';

export { Toolbar, resolveNextToolbarIndex, measureOverflowCount } from './Toolbar';
export type {
  ToolbarAlign,
  ToolbarContextValue,
  ToolbarGroupProps,
  ToolbarOrientation,
  ToolbarOverflowStrategy,
  ToolbarProps,
  ToolbarSeparatorProps,
  ToolbarSize,
  ToolbarSpacerProps,
  ToolbarVariant,
} from './Toolbar';

export { Tooltip } from './Tooltip';
export type {
  TooltipColor,
  TooltipPlacement,
  TooltipProps,
  TooltipSize,
  TooltipVariant,
} from './Tooltip';

export {
  Typography,
  Text,
  typographyRecipe,
  VARIANT_TO_ELEMENT as TYPOGRAPHY_VARIANT_TO_ELEMENT,
  resolveTypographyToken,
  TYPOGRAPHY_TOKEN_TABLES,
  TYPOGRAPHY_VAR_PREFIX,
  FONT_FAMILY_VARS as TYPOGRAPHY_FONT_FAMILY_VARS,
} from './Typography';
export type {
  TypographyAlign,
  TypographyDecoration,
  TypographyFontFamily,
  TypographyFontSize,
  TypographyLetterSpacing,
  TypographyLineHeight,
  TypographyOwnProps,
  TypographyProps,
  TypographyTokenProp,
  TypographyTransform,
  TypographyVariant,
  TypographyWeight,
} from './Typography';

export {
  TreeView,
  useTreeViewContext,
  flattenTree,
  findTreeNode,
  nextFocusableId,
  findByPrefix,
  ancestorIds,
  siblingIds,
  DEFAULT_TREE_TRANSLATIONS,
} from './TreeView';
export type {
  TreeNodeData,
  TreeNodeRenderState,
  TreeNodeRenderer,
  TreeViewContextValue,
  TreeViewNodeProps,
  TreeViewProps,
  TreeViewSelectionMode,
  TreeViewSize,
  TreeViewTranslations,
  TreeAsyncState,
  FlatTreeRow,
} from './TreeView';
