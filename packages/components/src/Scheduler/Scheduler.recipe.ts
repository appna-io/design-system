import { cv } from '@apx-ui/engine';

/* -------------------------------------------------------------------------- */
/*  Root container                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Outer chrome — the wrapper that holds the toolbar, view body, and any optional sidebar.
 * `isolate` opens a stacking context so absolute-positioned event cards inside views
 * don't leak z-index into the host page.
 */
export const schedulerRootRecipe = cv({
  base: 'isolate flex h-full w-full flex-col text-fg-default',
  variants: {
    variant: {
      solid: 'bg-bg-paper',
      outline: 'bg-bg-paper',
      soft: 'bg-bg-subtle/40',
      minimal: 'bg-transparent',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
    bordered: { true: 'border border-border', false: '' },
    roundedCorners: {
      none: 'rounded-none',
      sm: 'rounded-sm',
      md: 'rounded-md',
      lg: 'rounded-lg',
    },
    elevation: {
      none: '',
      sm: 'shadow-sm',
      md: 'shadow-md',
      lg: 'shadow-lg',
    },
  },
  compoundVariants: [
    { variant: 'minimal', bordered: true, class: 'border-0' },
  ],
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    bordered: true,
    roundedCorners: 'md',
    elevation: 'none',
  },
});

/* -------------------------------------------------------------------------- */
/*  Toolbar                                                                    */
/* -------------------------------------------------------------------------- */

export const schedulerToolbarRecipe = cv({
  base: 'flex w-full flex-wrap items-center gap-2 border-b border-border bg-inherit px-3 py-2',
  variants: {
    density: {
      compact: 'min-h-9',
      standard: 'min-h-11',
      comfortable: 'min-h-13',
    },
  },
  defaultVariants: { density: 'standard' },
});

export const schedulerToolbarTitleRecipe = cv({
  base: 'truncate ps-2 font-semibold tabular-nums text-fg-default',
  variants: {
    size: {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
    },
  },
  defaultVariants: { size: 'md' },
});

/* -------------------------------------------------------------------------- */
/*  Body / scroller                                                            */
/* -------------------------------------------------------------------------- */

export const schedulerBodyRecipe = cv({
  base: 'relative flex min-h-0 w-full flex-1 overflow-hidden',
});

export const schedulerScrollerRecipe = cv({
  base: 'relative h-full w-full overflow-auto',
});

/* -------------------------------------------------------------------------- */
/*  Month view                                                                 */
/* -------------------------------------------------------------------------- */

export const schedulerMonthGridRecipe = cv({
  base: 'grid h-full w-full auto-rows-fr grid-cols-7 border-t border-border',
});

export const schedulerMonthHeaderRecipe = cv({
  base: 'grid grid-cols-7 border-b border-border bg-bg-subtle/40 text-xs font-medium text-fg-muted',
});

export const schedulerMonthHeaderCellRecipe = cv({
  base: 'px-2 py-1.5 text-start',
});

export const schedulerMonthCellRecipe = cv({
  base: 'relative flex min-h-[88px] flex-col gap-1 border-b border-e border-border p-1 transition-colors duration-fast',
  variants: {
    inMonth: {
      true: 'bg-inherit',
      false: 'bg-bg-subtle/30 text-fg-muted',
    },
    isToday: {
      true: 'bg-primary-subtle/15',
      false: '',
    },
    isWeekend: {
      true: '',
      false: '',
    },
    isHoliday: {
      true: 'bg-warning-subtle/20',
      false: '',
    },
    isSelected: {
      true: 'ring-2 ring-inset ring-focus',
      false: '',
    },
    interactive: {
      true: 'cursor-pointer hover:bg-bg-subtle/60',
      false: '',
    },
  },
  defaultVariants: {
    inMonth: true,
    isToday: false,
    isWeekend: false,
    isHoliday: false,
    isSelected: false,
    interactive: true,
  },
});

export const schedulerMonthDayNumberRecipe = cv({
  base: 'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-medium tabular-nums',
  variants: {
    isToday: {
      true: 'bg-primary text-primary-contrast',
      false: 'text-fg-default',
    },
  },
  defaultVariants: { isToday: false },
});

/* -------------------------------------------------------------------------- */
/*  Time-grid views (week / day / workWeek / multiDay)                         */
/* -------------------------------------------------------------------------- */

export const schedulerTimeGridRecipe = cv({
  base: 'relative grid min-h-full w-full grid-cols-[64px_1fr] gap-0',
});

export const schedulerTimeGridHeaderRecipe = cv({
  base: 'sticky top-0 z-[2] flex flex-col border-b border-border bg-bg-paper',
});

export const schedulerTimeGridDayColumnHeaderRecipe = cv({
  base: 'flex flex-col items-center justify-center gap-0.5 border-e border-border/40 px-2 py-2 text-xs font-medium text-fg-muted',
  variants: {
    isToday: {
      true: 'text-primary',
      false: '',
    },
    interactive: {
      true: 'cursor-pointer hover:bg-bg-subtle/60',
      false: '',
    },
  },
  defaultVariants: { isToday: false, interactive: true },
});

export const schedulerTimeGridDayNumberRecipe = cv({
  base: 'inline-flex h-8 min-w-8 items-center justify-center rounded-full text-base font-semibold tabular-nums',
  variants: {
    isToday: {
      true: 'bg-primary text-primary-contrast',
      false: 'text-fg-default',
    },
  },
  defaultVariants: { isToday: false },
});

export const schedulerAllDayBandRecipe = cv({
  base: 'border-b border-border bg-bg-subtle/30',
});

export const schedulerAllDayLabelRecipe = cv({
  base: 'flex items-center justify-end pe-2 text-[10px] font-medium uppercase tracking-wide text-fg-muted',
});

export const schedulerAllDayCellRecipe = cv({
  base: 'relative min-h-[28px] border-e border-border/40',
});

export const schedulerTimeAxisRecipe = cv({
  base: 'pointer-events-none relative border-e border-border/40 bg-inherit text-[11px] text-fg-muted',
});

export const schedulerTimeAxisLabelRecipe = cv({
  base: 'absolute -mt-2 w-full pe-1.5 text-end tabular-nums',
});

export const schedulerHourLineRecipe = cv({
  base: 'pointer-events-none absolute inset-x-0 border-t border-border/30',
  variants: {
    half: {
      // The half-hour gridline is intentionally near-invisible — most calendar UIs
      // (Google / Outlook) only suggest the half-hour beat rather than carving a hard line.
      // Drag-to-create still snaps to `snapMinutes`, so a visible line is unnecessary.
      true: 'border-transparent',
      false: '',
    },
  },
  defaultVariants: { half: false },
});

export const schedulerDayColumnRecipe = cv({
  base: 'relative border-e border-border/40',
  variants: {
    isToday: {
      true: 'bg-primary-subtle/10',
      false: '',
    },
    isOffHours: {
      true: '',
      false: '',
    },
    isWeekend: {
      true: 'bg-bg-subtle/30',
      false: '',
    },
  },
  defaultVariants: { isToday: false, isOffHours: false, isWeekend: false },
});

export const schedulerOffHoursOverlayRecipe = cv({
  base: 'pointer-events-none absolute inset-x-0 bg-bg-subtle/40',
});

export const schedulerNowIndicatorRecipe = cv({
  base: 'pointer-events-none absolute inset-x-0 z-[3] flex items-center',
});

export const schedulerNowLineRecipe = cv({
  base: 'h-[2px] flex-1 bg-danger',
});

export const schedulerNowDotRecipe = cv({
  base: 'absolute start-0 -ms-1 size-3 rounded-full bg-danger ring-2 ring-bg',
});

export const schedulerNowLabelRecipe = cv({
  base: 'ms-1 inline-flex items-center rounded-sm bg-danger px-1 py-0 text-[10px] font-semibold leading-4 text-white',
});

/* -------------------------------------------------------------------------- */
/*  Event cards                                                                */
/* -------------------------------------------------------------------------- */

export const schedulerEventRecipe = cv({
  base: [
    'group relative box-border flex h-full w-full select-none flex-col gap-0.5',
    'overflow-hidden text-start text-xs',
    'transition-[box-shadow,transform] duration-fast ease-standard',
    'outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1',
  ].join(' '),
  variants: {
    shape: {
      rect: 'rounded-sm',
      pill: 'rounded-full px-2',
      cardSlim: 'rounded-md shadow-sm',
    },
    variant: {
      solid: 'border border-transparent',
      outline: 'border bg-bg-paper',
      soft: 'border border-transparent',
      minimal: 'border border-transparent bg-transparent',
    },
    color: {
      primary: '',
      secondary: '',
      success: '',
      warning: '',
      danger: '',
      info: '',
      neutral: '',
    },
    density: {
      compact: 'px-1 py-0.5 text-[11px]',
      standard: 'px-1.5 py-1',
      comfortable: 'px-2 py-1.5 text-sm',
    },
    isSelected: {
      true: 'ring-2 ring-focus ring-offset-1',
      false: '',
    },
    isGhost: {
      true: 'opacity-50 pointer-events-none',
      false: '',
    },
    allDay: {
      true: 'border-l-2 ps-2 [&]:rounded-sm',
      false: '',
    },
    interactive: {
      true: 'cursor-pointer hover:shadow-sm hover:brightness-95',
      false: '',
    },
  },
  compoundVariants: [
    /* solid × color — filled chip */
    { variant: 'solid', color: 'primary', class: 'bg-primary text-primary-contrast' },
    { variant: 'solid', color: 'secondary', class: 'bg-secondary text-secondary-contrast' },
    { variant: 'solid', color: 'success', class: 'bg-success text-success-contrast' },
    { variant: 'solid', color: 'warning', class: 'bg-warning text-warning-contrast' },
    { variant: 'solid', color: 'danger', class: 'bg-danger text-danger-contrast' },
    { variant: 'solid', color: 'info', class: 'bg-info text-info-contrast' },
    { variant: 'solid', color: 'neutral', class: 'bg-fg-default text-bg-paper' },
    /* outline × color — bordered card */
    { variant: 'outline', color: 'primary', class: 'border-primary text-primary' },
    { variant: 'outline', color: 'secondary', class: 'border-secondary text-secondary' },
    { variant: 'outline', color: 'success', class: 'border-success text-success' },
    { variant: 'outline', color: 'warning', class: 'border-warning text-warning' },
    { variant: 'outline', color: 'danger', class: 'border-danger text-danger' },
    { variant: 'outline', color: 'info', class: 'border-info text-info' },
    { variant: 'outline', color: 'neutral', class: 'border-border text-fg-default' },
    /* soft × color — tinted chip with full-opacity fill + colored left accent rail so the
     * card reads as "above the grid" instead of a faint tint. Matches Google Calendar's
     * default colored-block style for non-conflicting events. */
    { variant: 'soft', color: 'primary', class: 'bg-primary-subtle text-primary shadow-sm border-s-[3px] border-s-primary' },
    { variant: 'soft', color: 'secondary', class: 'bg-secondary-subtle text-secondary shadow-sm border-s-[3px] border-s-secondary' },
    { variant: 'soft', color: 'success', class: 'bg-success-subtle text-success shadow-sm border-s-[3px] border-s-success' },
    { variant: 'soft', color: 'warning', class: 'bg-warning-subtle text-warning shadow-sm border-s-[3px] border-s-warning' },
    { variant: 'soft', color: 'danger', class: 'bg-danger-subtle text-danger shadow-sm border-s-[3px] border-s-danger' },
    { variant: 'soft', color: 'info', class: 'bg-info-subtle text-info shadow-sm border-s-[3px] border-s-info' },
    { variant: 'soft', color: 'neutral', class: 'bg-bg-subtle text-fg-default shadow-sm border-s-[3px] border-s-border-strong' },
    /* minimal × color — left-border accent only */
    { variant: 'minimal', color: 'primary', class: 'border-s-2 border-s-primary ps-1.5 text-primary' },
    { variant: 'minimal', color: 'secondary', class: 'border-s-2 border-s-secondary ps-1.5 text-secondary' },
    { variant: 'minimal', color: 'success', class: 'border-s-2 border-s-success ps-1.5 text-success' },
    { variant: 'minimal', color: 'warning', class: 'border-s-2 border-s-warning ps-1.5 text-warning' },
    { variant: 'minimal', color: 'danger', class: 'border-s-2 border-s-danger ps-1.5 text-danger' },
    { variant: 'minimal', color: 'info', class: 'border-s-2 border-s-info ps-1.5 text-info' },
    { variant: 'minimal', color: 'neutral', class: 'border-s-2 border-s-border ps-1.5 text-fg-default' },
    /* all-day band accent overrides — keep the inline-flex feel of a single row */
    { allDay: true, variant: 'soft', color: 'primary', class: 'border-s-primary' },
    { allDay: true, variant: 'soft', color: 'secondary', class: 'border-s-secondary' },
    { allDay: true, variant: 'soft', color: 'success', class: 'border-s-success' },
    { allDay: true, variant: 'soft', color: 'warning', class: 'border-s-warning' },
    { allDay: true, variant: 'soft', color: 'danger', class: 'border-s-danger' },
    { allDay: true, variant: 'soft', color: 'info', class: 'border-s-info' },
    { allDay: true, variant: 'soft', color: 'neutral', class: 'border-s-border' },
  ],
  defaultVariants: {
    shape: 'rect',
    variant: 'soft',
    color: 'primary',
    density: 'standard',
    isSelected: false,
    isGhost: false,
    allDay: false,
    interactive: true,
  },
});

export const schedulerEventTitleRecipe = cv({
  base: 'truncate font-semibold leading-tight',
});

export const schedulerEventTimeRecipe = cv({
  base: 'truncate text-[10px] leading-tight opacity-80',
});

export const schedulerEventResizeHandleRecipe = cv({
  base: 'absolute inset-x-0 h-1.5 cursor-row-resize opacity-0 transition-opacity group-hover:opacity-100',
  variants: {
    edge: {
      start: 'top-0',
      end: 'bottom-0',
    },
  },
  defaultVariants: { edge: 'end' },
});

/* -------------------------------------------------------------------------- */
/*  Quick popover (Google-Calendar style)                                      */
/* -------------------------------------------------------------------------- */

export const schedulerQuickPopoverRecipe = cv({
  base: 'flex w-[360px] max-w-[calc(100vw-32px)] flex-col gap-3 p-4',
});

export const schedulerQuickPopoverHeaderRecipe = cv({
  base: 'flex items-start justify-between gap-2',
});

export const schedulerQuickPopoverTabsRecipe = cv({
  base: 'flex gap-1 border-b border-border pb-2',
});

export const schedulerQuickPopoverFieldRowRecipe = cv({
  base: 'flex items-center gap-2 text-sm',
});

export const schedulerQuickPopoverFooterRecipe = cv({
  base: 'mt-1 flex items-center justify-end gap-2 pt-2',
});

/* -------------------------------------------------------------------------- */
/*  Agenda                                                                     */
/* -------------------------------------------------------------------------- */

export const schedulerAgendaListRecipe = cv({
  base: 'flex flex-col divide-y divide-border',
});

export const schedulerAgendaDayRecipe = cv({
  base: 'grid grid-cols-[120px_1fr] gap-4 px-4 py-3',
});

export const schedulerAgendaDayLabelRecipe = cv({
  base: 'text-xs font-semibold uppercase tracking-wide text-fg-muted',
  variants: {
    isToday: {
      true: 'text-primary',
      false: '',
    },
  },
  defaultVariants: { isToday: false },
});

export const schedulerAgendaEventRecipe = cv({
  base: 'flex flex-col gap-0.5 rounded-sm border-s-2 px-2 py-1 text-sm hover:bg-bg-subtle/60',
});

/* -------------------------------------------------------------------------- */
/*  Drag preview / selection band                                              */
/* -------------------------------------------------------------------------- */

export const schedulerDragPreviewRecipe = cv({
  base: 'pointer-events-none absolute z-[2] flex flex-col rounded-sm border-2 border-dashed border-primary bg-primary-subtle/40 text-[11px] font-medium text-primary',
});

export const schedulerSlotSelectionRecipe = cv({
  base: 'pointer-events-none absolute z-[1] rounded-sm border-2 border-primary bg-primary-subtle/30',
});

/* -------------------------------------------------------------------------- */
/*  Holiday badge                                                              */
/* -------------------------------------------------------------------------- */

export const schedulerHolidayBadgeRecipe = cv({
  base: 'inline-flex max-w-full items-center gap-1 truncate rounded-sm bg-warning-subtle px-1.5 py-0.5 text-[10px] font-medium text-warning',
});

export const schedulerHolidayBannerRecipe = cv({
  base: 'flex items-center gap-2 border-b border-border bg-warning-subtle/30 px-3 py-1 text-xs text-warning',
});

/* -------------------------------------------------------------------------- */
/*  Empty / loading                                                            */
/* -------------------------------------------------------------------------- */

export const schedulerEmptyRecipe = cv({
  base: 'flex h-full w-full flex-col items-center justify-center gap-2 p-12 text-center text-sm text-fg-muted',
});

/* -------------------------------------------------------------------------- */
/*  Sidebar + chrome (PR 7)                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Two-column body layout when a sidebar is enabled. The grid keeps the sidebar at a fixed
 * `260px` and lets the view fill the remainder. RTL switches the sidebar to the trailing
 * side automatically via `gridTemplateColumns: '[start] 260px [view] 1fr [end]'` swapped at
 * the consumer level — the recipe stays direction-neutral.
 */
export const schedulerBodyWithSidebarRecipe = cv({
  base: 'relative flex min-h-0 w-full flex-1 overflow-hidden',
});

export const schedulerSidebarRecipe = cv({
  base: 'flex h-full w-[260px] shrink-0 flex-col gap-4 overflow-y-auto border-e border-border bg-bg-paper/60 p-3',
});

export const schedulerSidebarSectionRecipe = cv({
  base: 'flex flex-col gap-1.5',
});

export const schedulerCalendarListRecipe = cv({
  base: 'flex flex-col gap-1',
});

export const schedulerCalendarListItemRecipe = cv({
  base: 'flex items-center gap-2 rounded-sm px-1 py-0.5 hover:bg-bg-subtle/60',
});

export const schedulerCalendarListSwatchRecipe = cv({
  base: 'inline-block size-2.5 shrink-0 rounded-full ring-1 ring-border',
});

/* ---- Mini-month grid (sidebar) ---- */

export const schedulerMiniMonthRecipe = cv({
  base: 'flex w-full flex-col gap-1 text-xs',
});

export const schedulerMiniMonthHeaderRecipe = cv({
  base: 'flex items-center justify-between gap-1 px-0.5 text-fg-default',
});

export const schedulerMiniMonthNavBtnRecipe = cv({
  base: 'inline-flex size-6 items-center justify-center rounded-sm text-fg-muted hover:bg-bg-subtle/60 hover:text-fg-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
});

export const schedulerMiniMonthGridRecipe = cv({
  base: 'grid grid-cols-7 gap-y-0.5',
});

export const schedulerMiniMonthDowRecipe = cv({
  base: 'flex h-6 items-center justify-center text-[10px] font-medium uppercase tracking-wide text-fg-muted',
});

export const schedulerMiniMonthDayRecipe = cv({
  base: 'inline-flex h-6 items-center justify-center rounded-full text-[11px] tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
  variants: {
    isCurrentMonth: { true: 'text-fg-default', false: 'text-fg-muted/60' },
    isSelected: { true: 'bg-primary text-fg-onPrimary', false: 'hover:bg-bg-subtle/60' },
    isToday: { true: 'ring-1 ring-primary', false: '' },
  },
  defaultVariants: { isCurrentMonth: true, isSelected: false, isToday: false },
});

/* ---- Filter menu trigger badge ---- */

export const schedulerFilterCountBadgeRecipe = cv({
  base: 'ms-1 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-fg-onPrimary',
});