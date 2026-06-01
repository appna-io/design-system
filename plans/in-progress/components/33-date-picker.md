# Phase 33 — `<Calendar />` + `<DatePicker />` + `<DateRangePicker />`

> Status: **PR 1 + PR 2 + PR 3 + PR 4 + PR 5 SHIPPED · PR 6 + PR 7 Pending** · **Tier: COMPLEX (Tier 2.5)** · Depends on: Phase 7 (Input) · Phase 18 (Popover) · Phase 6 (Button) · Engine `<I18nProvider>` (from Phase 27) · Phase 22 (Menu — for month/year jump select) · Optional: Phase 29 (NumberInput — for the year field) · Blocks: future DateTimePicker / TimeRangePicker / Scheduling primitives
> Establishes the `<Calendar />` primitive that all future date-based components consume.

> ### Implementation status snapshot (last updated 2026-05-26 — see `packages/components/src/Calendar/` and `packages/components/src/DatePicker/`)
>
> **Shipped — PR 1 (dateMath) + PR 2 (useCalendar + grid) + PR 3 (`<Calendar />` DOM + keyboard) + PR 4 (`<DatePicker />` + parser) + PR 5 (`<DateRangePicker />` + presets):**
>
> _Calendar package (`packages/components/src/Calendar/`):_
>
> - `Calendar.types.ts` — full public surface (CalendarProps, CalendarMode, CalendarValue, CalendarDay, CalendarDayState, CalendarTranslations, DateRange, RenderCalendarDayContext / HeaderContext / WeekdayContext, UseCalendarOptions, UseCalendarReturn, the 4×7×3 variant axes).
> - `helpers/dateMath.ts` (~290 LoC) — all 12 helpers from the plan plus the Scheduler-flavoured extras the consumers need (`addMinutes`, `addHours`, `endOfDay`, `differenceInDays`, `intervalsOverlap`, `eachDayInRange`, `eachDayKeyInRange`, `isoWeekNumber`, `min`/`max`/`clampDate`, `rangeOfDays`, etc.). `parseIsoDate` is strict (rejects `2026-02-31`); `formatIsoDate` matches `toDayKey`. Pure, dependency-free.
> - `helpers/locale.ts` — `getFirstDayOfWeek` (prefers `Intl.Locale.weekInfo`, falls back to a 14-region table), `getWeekdayNames` (3 forms × 7 days rotated by `weekStartsOn`), `getMonthName`, `getMonthYearTitle`, `getLongDayLabel`.
> - `helpers/parseDateFormat.ts` — Unicode TR 35 subset (yyyy / yy / MMMM / MMM / MM / M / dd / d). Permissive on separators, two-digit year pivot ±50, locale-aware month-name parsing, rejects overflow dates (Feb 31 → null).
> - `headless/useCalendar.ts` (~330 LoC) — mode-aware state machine (single / multiple / range), controlled-or-uncontrolled `value` AND `month`, hover-preview state for range UX, focused-day state for roving tabindex, memoized `monthGrids` (per visible month, per week, per day), 6 predicate methods (`isDateSelected` / `isDateInRange` / `isDateRangeStart` / `isDateRangeEnd` / `isDateInPreview` / `isDateDisabledFn`).
> - `headless/useCalendarKeyboard.ts` — full W3C Date Picker Dialog pattern (Arrow Left/Right with RTL flip, Arrow Up/Down for ±7 days, Home/End for week boundaries, Ctrl/Cmd+Home/End for month boundaries, PageUp/Down for ±1 month, Shift+PageUp/Down for ±1 year, Enter/Space to select). Auto-shifts the visible month when focus moves off-grid.
> - `Calendar.recipe.ts` — 11 themable recipes for the Calendar slots (root / header / headerTitle / navButton / monthsRow / month / weekdaysRow / weekday / weeksGrid / weekNumberCell / day) + 5 for the DatePicker (trigger / presetList / presetItem / applyBar / popoverContent). The `day` recipe uses boolean variants per state (`isSelected` / `isToday` / `isRangeStart`/`isRangeMiddle`/`isRangeEnd` / `isRangePreview` / `isOutside` / `isDisabled`) with compound rules for start===end and middle-with-preview collisions.
> - `Calendar.tsx` — top-level component with `<CalendarContext.Provider>`, default header (year + month nav buttons, locale-aware title with `aria-live="polite"`), `<MonthsRow>` rendering `numberOfMonths` independent `<CalendarMonthGrid>` instances.
> - `parts/CalendarMonthGrid.tsx` — one month's `role="grid"` with weekday header row (with optional ISO week-number gutter), per-week `role="row"` (using `display: contents` so the grid template layout still works), per-day `role="gridcell"` button. Roving tabindex: only the focused day has `tabIndex=0`. Auto-refocuses the focused day after keyboard nav crosses months.
> - `Calendar.i18n.ts` — `DEFAULT_CALENDAR_TRANSLATIONS` + `mergeCalendarTranslations(base, fromProvider, fromProp)` shallow-merge helper (same pattern as Scheduler / DataGrid / Pagination / Combobox).
> - `CalendarContext.ts` — internal context combining the headless return with the resolved variant axes + `rootId` for `aria-labelledby` wiring.
> - `meta.ts` + `index.ts` — full re-export surface.
>
> _DatePicker package (`packages/components/src/DatePicker/`):_
>
> - `DatePicker.tsx` — `<Input>` + `<Popover>` + `<Calendar mode="single">`. Typed-input mirror (kept in sync via `useEffect`), Enter/blur commits via `parseDateFormat`, invalid commits revert silently. Hidden `<input type="hidden">` carries ISO-8601 form payload. Clear button replaces the calendar trigger when a value is set and `clearable` is on. Optional `presets` rail (e.g. "Today"). Maps the 4-value variant axis down to the Input's 3-value axis (`soft` → `outline`, `minimal` → `ghost`).
> - `DateRangePicker.tsx` — same composition with `mode="range"`, `numberOfMonths={2}`, paired start/end inputs separated by a configurable separator (default `–`), preset rail (e.g. "Last 7 days"), commit-both-or-revert behavior. Hidden form field carries `YYYY-MM-DD,YYYY-MM-DD`. Closes popover only after both endpoints commit (when `closeOnSelect`).
> - `DatePicker.types.ts` — `DatePickerProps`, `DateRangePickerProps`, `DatePickerPreset`, `DateRangePickerPreset`, `PickerPopoverOptions`, `PickerMode`.
> - `meta.ts` + `index.ts` — full re-export surface.
>
> _Examples shipped:_
>
> - Calendar: Basic, Range, Multiple, MinMax, DisableWeekends, Locales (en-US / de-DE / ja-JP side-by-side), Sizes (sm/md/lg), Variants (solid/outline/soft/minimal), WeekNumbers, CustomDayRender.
> - DatePicker: Basic, Range, Presets, MinMax, CustomFormat (3 token strings), Locales (de uses `dd.MM.yyyy`, ja uses `yyyy/MM/dd`), FormSubmission (submits, prints the ISO-8601 payload).
>
> _Cross-cutting:_
>
> - All 7 helpers + types + recipes + components re-exported from `packages/components/src/index.ts` under the `Calendar` and `DatePicker / DateRangePicker` sections. Helper aliases (`calendarAddDays`, `calendarComputeMonthGrid`, etc.) avoid the name clash with the Scheduler's existing local copy — the Scheduler keeps its local helpers for this phase and will switch to the Calendar re-exports in a separate refactor PR.
> - Components package `pnpm build` + `pnpm typecheck` green.
> - Umbrella `apx-ds` rebuilt → `dist/index.js` 1.50 MB ESM / 1.53 MB CJS.
> - Example registry regenerated → 692 total entries, +17 from Phase 33 (10 Calendar + 7 DatePicker).
>
> **Deferred to PR 6 + PR 7:**
>
> - **PR 6 — Localization bundles.** Hebrew (`heCalendarTranslations`) and Arabic (`arCalendarTranslations`) bundles, RTL visual snapshot suite, Hijri / Buddhist calendar locale tests (date math stays Gregorian; only formatting changes). The mechanics are already in place — `getFirstDayOfWeek('he-IL')` returns Sunday, `getWeekdayNames('ar-EG', 6)` returns the Saturday-first Arabic labels — but no language-bundle file is shipped yet and the visual layer hasn't been audited under `dir="rtl"`.
> - **PR 7 — Polish.** README.mdx, `Calendar.test.tsx` / `Calendar.a11y.test.tsx` / `DatePicker.test.tsx` / `DateRangePicker.test.tsx` / `parseDateFormat.test.ts` / `dateMath.test.ts` / `computeMonthGrid.test.ts`, axe-core sweep across the 4×7×3 variant matrix × 3 modes × {LTR, RTL}, bundle-size benchmark vs the 9 KB gz target, perf benchmark vs the latency table.
>
> **Follow-up (not in the original PR split):**
>
> - **Scheduler refactor.** Replace `Scheduler/helpers/dateMath.ts` with re-exports from `Calendar/helpers/dateMath.ts`, replace `SchedulerMiniMonth` with a thin wrapper around `<Calendar mode="single" numberOfMonths={1} size="sm">`. Tracked under Phase 58's deferred items.

## Objective

Ship the date-selection family in one coherent phase:

1. **`<Calendar />`** — the headless + visual primitive for displaying & selecting dates. Standalone usable for inline pickers (booking flows, dashboards).
2. **`<DatePicker />`** — an `<Input>` + Calendar in a `<Popover>`. Single-date selection with typeable input.
3. **`<DateRangePicker />`** — two-month Calendar in a Popover, returns `{ start, end }`. Common preset shortcuts ("Last 7 days", "This month").

All three share state machines, recipes, and the same locale/RTL-aware foundation. Single phase to keep them consistent.

---

## What This Component Proves

- The DS can ship complex date interactions **without `date-fns` / `dayjs` / `luxon`** — uses native `Intl.DateTimeFormat` + a tiny pure helper for date arithmetic.
- A keyboard-rich grid widget (Calendar) follows the W3C "Grid" pattern just like `<DataGrid>` does — pattern reuse.
- Locale-aware month/weekday rendering + first-day-of-week + RTL all flow from `Intl.Locale` without per-locale config.
- The Popover + Input + Calendar composition (a "menu over a field") is now formally established as the **input-with-overlay** pattern; future Combobox / TimePicker / ColorPicker reuse it.

---

## Public API

```tsx
import { Calendar, DatePicker, DateRangePicker } from 'apx-ds';
// Inline calendar
<Calendar value={date} onChange={setDate} />

// Date input + popover calendar
<DatePicker
  value={date}
  onChange={setDate}
  min={new Date(2024, 0, 1)}
  max={new Date(2030, 11, 31)}
  placeholder="MM/DD/YYYY"
/>

// Range
<DateRangePicker
  value={range}
  onChange={setRange}
  presets={[
    { id: 'last7',  label: 'Last 7 days',  range: () => ({ start: subDays(today, 6), end: today }) },
    { id: 'thismo', label: 'This month',   range: () => ({ start: startOfMonth(today), end: endOfMonth(today) }) },
  ]}
/>

// Full Calendar prop form
<Calendar
  /* value */
  mode="single"                       // 'single' | 'multiple' | 'range'
  value={date}                        // Date | Date[] | { start: Date | null; end: Date | null }
  defaultValue={undefined}
  onChange={(v) => …}
  /* navigation */
  month={new Date(2026, 4, 1)}        // controlled visible month
  defaultMonth={new Date()}
  onMonthChange={(d) => …}
  numberOfMonths={1}                  // 1 (DatePicker) or 2 (DateRangePicker)
  /* constraints */
  min={undefined}
  max={undefined}
  isDateDisabled={(d) => boolean}     // arbitrary predicate (e.g. disable weekends)
  /* locale */
  locale="en-US"                      // any BCP-47 — drives weekday/month names + first-day-of-week
  weekStartsOn={undefined}            // override (0=Sunday, 1=Monday …); default from locale
  /* visual */
  variant="solid"                     // 'solid' | 'outline' | 'soft' | 'minimal'
  size="md"                           // 'sm' | 'md' | 'lg'
  color="primary"
  /* features */
  showWeekNumbers={false}
  showOutsideDays={true}              // dim days from prev/next month
  fixedWeeks={false}                  // always render 6 rows (prevents layout shift)
  /* render slots */
  renderDay={({ date, isSelected, isToday, isDisabled, isOutside }) => ReactNode}
  renderWeekday={(weekday) => ReactNode}
  renderHeader={({ month, year, prevMonth, nextMonth, jumpToMonth, jumpToYear }) => ReactNode}
  /* events */
  onDayHover={(d) => …}               // critical for range preview
  /* a11y */
  aria-label="Calendar"
  /* misc */
  className=""
  sx={{}}
/>

// Full DatePicker prop form (extends Calendar)
<DatePicker
  /* value */
  value={undefined}                   // Date | null
  defaultValue={undefined}
  onChange={(d: Date | null) => …}
  /* input */
  format="MM/dd/yyyy"                 // display + parse pattern
  parse={(s) => Date | null}          // custom parser; default uses `format`
  inputProps={…}                      // forwarded to <Input>
  /* overlay */
  open={undefined}                    // controlled
  defaultOpen={false}
  onOpenChange={(b) => …}
  placement="bottom-start"            // Popover placement (RTL-aware via logical-start)
  closeOnSelect={true}
  /* presets (single-date variant of range presets) */
  presets={[]}
  /* clear button */
  clearable={true}
  /* form */
  name="dueDate"
  required={false}
  /* state */
  disabled={false}
  invalid={false}
  /* …everything from Calendar (numberOfMonths, locale, …) */
/>

// DateRangePicker — same as DatePicker but mode="range" and value is { start, end }
```

---

## API Decisions

| Decision                                                            | Why                                                                                          |
| ------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| **One `<Calendar>` for `single` / `multiple` / `range` modes**      | Same data model surface, same keyboard pattern, same visual matrix.                          |
| **`numberOfMonths` instead of separate components**                 | Two-month range picker is the same Calendar rendered twice with shared state.                |
| **Date math is local, no external date lib**                        | Saves ~30 KB. We need ~12 helpers (`startOfMonth`, `endOfMonth`, `addMonths`, `addDays`, `isSameDay`, etc.) — all pure, all unit-tested. |
| **`format` is `'MM/dd/yyyy'`-style tokens**                         | Familiar to most developers (Unicode TR 35 subset). Our parser is permissive on input.       |
| **Display uses `Intl.DateTimeFormat`**                              | Locale-correct without us shipping locale data.                                              |
| **`locale` drives weekday names + first-day-of-week**               | `new Intl.Locale(locale).weekInfo.firstDay` (with fallback table for browsers without `weekInfo`). |
| **Range preview on hover (`onDayHover`)**                           | Industry standard UX.                                                                        |
| **Hidden `<input type="hidden">` + ISO-8601 (`YYYY-MM-DD`) string** | Form submission with unambiguous, locale-free value.                                         |
| **Presets are an array of `{ id, label, range: () => Range }`**     | Simple, lazy (preset computes at click time so "today" is fresh).                            |
| **`<Calendar>` works without `<DatePicker>`**                       | Inline usage (e.g. booking-flow side panel) doesn't need popover/input.                      |

---

## Variants — Designed Inline

### Calendar grid

| Variant   | Day cell idle           | Day cell hover          | Day cell selected             | Range preview         |
| --------- | ----------------------- | ----------------------- | ----------------------------- | --------------------- |
| `solid`   | transparent             | `bg-bg-subtle`          | `bg-<color>-solid text-fg-inv`| `bg-<color>-subtle`   |
| `outline` | transparent             | `bg-bg-subtle border`   | `bg-<color>-solid border`     | `bg-<color>-subtle`   |
| `soft`    | transparent             | `bg-<color>-subtle/40`  | `bg-<color>-soft text-<color>-solid` | `bg-<color>-subtle/60` |
| `minimal` | transparent             | `bg-<color>-subtle/40`  | underline + `text-<color>-solid` (no fill) | underline only |

Today indicator: small dot under the day number (or ring around) regardless of variant. Out-of-month days: `opacity-40`. Disabled days: `opacity-30 line-through pointer-events-none`. Focus ring uses standard `ring-ring` tokens.

### Range-specific states

- **Range start**: `rounded-s-md` (logical) + selected color.
- **Range end**: `rounded-e-md` (logical) + selected color.
- **Range middle**: `bg-<color>-subtle` + no rounding.
- **Range hover-preview**: same as middle but with `opacity-60`.
- **Single-day range** (start === end): `rounded-md` + selected color.

### Sizes

| Size | Day cell  | Header text   | Weekday text       | Total width (1 month) |
| ---- | --------- | ------------- | ------------------ | --------------------- |
| `sm` | 28×28     | `text-sm`     | `text-xs`          | ~252px                |
| `md` | 36×36     | `text-base`   | `text-sm`          | ~308px                |
| `lg` | 44×44     | `text-lg`     | `text-base`        | ~364px                |

Touch target enforced at `md` / `lg`. `sm` uses 28px cells + padded hit area for keyboard/touch.

---

## File Structure

```
packages/components/src/Calendar/
├── Calendar.tsx
├── Calendar.types.ts
├── Calendar.recipe.ts                  # 8 slots: root, header, headerTitle, navButton, weekdaysRow, weekday, week, day
├── headless/
│   ├── useCalendar.ts                  # state machine (value, month nav, hover preview)
│   ├── useCalendarKeyboard.ts          # arrow keys / PageUp/Down / Home/End / Enter
│   ├── computeMonthGrid.ts             # pure: (month, locale, options) → CalendarDay[][]
│   ├── computeRangeState.ts            # pure: (day, range, hoverPreview) → DayRangeState
│   └── dateMath.ts                     # pure helpers: startOfMonth, endOfMonth, addDays, addMonths, isSameDay, parseIso, formatIso
├── locale/
│   ├── getFirstDayOfWeek.ts            # Intl.Locale.weekInfo with fallback table
│   ├── getWeekdayNames.ts              # short + long via Intl.DateTimeFormat
│   └── getMonthName.ts
├── Calendar.test.tsx
├── Calendar.a11y.test.tsx
├── dateMath.test.ts                    # exhaustive pure tests
├── computeMonthGrid.test.ts            # exhaustive locale tests
├── Calendar.rtl.test.tsx
├── index.ts                            # Object.assign(Calendar, { Day, Header, … }) — composition optional
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Range.tsx
    ├── Multiple.tsx                    # mode="multiple" — select discrete days
    ├── TwoMonths.tsx
    ├── MinMax.tsx
    ├── DisableWeekends.tsx
    ├── LocaleDe.tsx                    # Sunday → Monday week start
    ├── LocaleHe.tsx                    # RTL Hebrew
    ├── LocaleAr.tsx                    # RTL Arabic + Hijri formatting via Intl
    ├── WeekNumbers.tsx
    ├── FixedWeeks.tsx
    ├── CustomDayRender.tsx             # event-dot indicators per day
    ├── Variants.tsx
    └── Sizes.tsx

packages/components/src/DatePicker/
├── DatePicker.tsx
├── DateRangePicker.tsx
├── DatePicker.types.ts
├── DatePicker.recipe.ts                # trigger button + presetList recipes (Calendar reused)
├── parseDateFormat.ts                  # pure: 'MM/dd/yyyy' + string → Date | null
├── formatDate.ts                       # pure: Date + 'MM/dd/yyyy' → string
├── DatePicker.test.tsx
├── DateRangePicker.test.tsx
├── DatePicker.a11y.test.tsx
├── parseDateFormat.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── Range.tsx
    ├── Presets.tsx
    ├── TwoMonths.tsx
    ├── MinMax.tsx
    ├── Clearable.tsx
    ├── InlineCalendar.tsx              # uses <Calendar> directly without picker chrome
    ├── CustomFormat.tsx                # format="yyyy-MM-dd"
    ├── LocaleDe.tsx
    ├── LocaleHe.tsx                    # RTL
    ├── Disabled.tsx
    ├── Invalid.tsx
    └── FormSubmission.tsx
```

---

## Headless Layer — `useCalendar()`

```ts
export interface UseCalendarOptions {
  mode: 'single' | 'multiple' | 'range';
  value?: Date | Date[] | DateRange | null;
  defaultValue?: Date | Date[] | DateRange | null;
  onChange?: (v: Date | Date[] | DateRange | null) => void;
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (d: Date) => void;
  numberOfMonths?: number;              // default 1
  min?: Date;
  max?: Date;
  isDateDisabled?: (d: Date) => boolean;
  locale: string;                        // default app locale or 'en-US'
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  fixedWeeks?: boolean;
  showOutsideDays?: boolean;
  closeOnSelect?: boolean;
}

export interface UseCalendarReturn {
  /* state */
  mode: 'single' | 'multiple' | 'range';
  value: Date | Date[] | DateRange | null;
  visibleMonths: Date[];                 // length === numberOfMonths
  weekdays: { short: string; long: string }[];
  monthGrids: CalendarDay[][][];         // outer per month, middle per week, inner per day
  hoverPreview: Date | null;             // for range hover-preview
  /* actions */
  setValue: (v: Date | Date[] | DateRange | null) => void;
  selectDay: (d: Date) => void;          // mode-aware selection + clear logic
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToPrevYear: () => void;
  goToNextYear: () => void;
  jumpToMonth: (month: number) => void;
  jumpToYear: (year: number) => void;
  setHoverPreview: (d: Date | null) => void;
  /* derived */
  isDateInRange: (d: Date) => boolean;
  isDateRangeStart: (d: Date) => boolean;
  isDateRangeEnd: (d: Date) => boolean;
  isDateSelected: (d: Date) => boolean;
  isDateDisabled: (d: Date) => boolean;
  isDateInPreview: (d: Date) => boolean;
}
```

`<Calendar>` is a thin DOM layer over `useCalendar()`. The hook is exported publicly for consumers who want to roll their own visuals.

---

## Pure Date Math — `dateMath.ts`

12 functions, all pure, all locale-free. ~150 LoC total.

```ts
export function startOfMonth(d: Date): Date;
export function endOfMonth(d: Date): Date;
export function startOfWeek(d: Date, weekStartsOn: number): Date;
export function endOfWeek(d: Date, weekStartsOn: number): Date;
export function startOfDay(d: Date): Date;
export function addDays(d: Date, n: number): Date;
export function addMonths(d: Date, n: number): Date;
export function addYears(d: Date, n: number): Date;
export function isSameDay(a: Date, b: Date): boolean;
export function isSameMonth(a: Date, b: Date): boolean;
export function isInRange(d: Date, start: Date, end: Date): boolean;
export function clampDate(d: Date, min?: Date, max?: Date): Date;
export function parseIsoDate(s: string): Date | null;        // 'YYYY-MM-DD'
export function formatIsoDate(d: Date): string;              // 'YYYY-MM-DD'
```

All edge cases tested (Feb 29 → Mar 28 via `addMonths`, DST transitions, year-boundary crossings, etc.). 100% line coverage on this file is a hard requirement.

---

## Format Parser — `parseDateFormat.ts`

```ts
export function parseDateFormat(
  input: string,
  format: string,          // e.g. 'MM/dd/yyyy', 'dd.MM.yyyy', 'yyyy-MM-dd'
  locale?: string
): Date | null;

export function formatDate(d: Date, format: string, locale?: string): string;
```

Token set (intentionally minimal — Unicode TR 35 subset):

| Token   | Meaning                       | Example       |
| ------- | ----------------------------- | ------------- |
| `yyyy`  | 4-digit year                  | 2026          |
| `yy`    | 2-digit year                  | 26            |
| `MMMM`  | Full month name (locale)      | January       |
| `MMM`   | Short month name              | Jan           |
| `MM`    | 2-digit month                 | 01            |
| `M`     | 1- or 2-digit month           | 1             |
| `dd`    | 2-digit day                   | 05            |
| `d`     | 1- or 2-digit day             | 5             |
| `EEEE`  | Full weekday name             | Monday        |
| `EEE`   | Short weekday name            | Mon           |

Parser is **permissive** on input separators: `12/31/2026` parses with `MM/dd/yyyy` even if user typed `12-31-2026`. Whitespace flexible. Two-digit year `26` resolves to `2026` via standard pivot (current year ± 50).

---

## Locale + RTL

### Locale-aware behavior

- **First day of week**: `new Intl.Locale(locale).getWeekInfo().firstDay` (most modern browsers). Fallback table for ~12 locales (Sun = US/CA/JP/IL, Mon = most of EU, Sat = ME).
- **Weekday names**: `Intl.DateTimeFormat(locale, { weekday: 'short' | 'long' })`.
- **Month names**: same.
- **Hijri / Buddhist / Hebrew calendars**: opt-in via `locale="ar-SA-u-ca-islamic"` — `Intl.DateTimeFormat` handles formatting; date math stays on Gregorian internally with a display-only translation.

### RTL

- Day grid `<table>` flows `dir`-correctly automatically.
- Nav arrows: prev/next chevrons use logical `<ChevronStart />` / `<ChevronEnd />` icons that flip under `dir="rtl"`.
- Range start/end rounding uses `rounded-s-md` / `rounded-e-md` (logical).
- Two-month layout in `numberOfMonths={2}`: order follows `dir` (first month on logical start; in RTL the "current" month is on the right physically).
- Hebrew + Arabic locale tests in `Calendar.rtl.test.tsx`.

---

## A11y

Calendar implements W3C **Date Picker Dialog Pattern**:

- Root: `role="application"` (per WAI-ARIA Date Picker) OR `role="dialog"` when inside a Popover.
- Day grid: `role="grid"`, `aria-labelledby` pointing to header (e.g. "May 2026").
- Each week row: `role="row"`.
- Each day cell: `role="gridcell"`, `aria-selected={isSelected}`, `aria-disabled={isDisabled}`, `aria-current="date"` for today.
- Header: live region announces the visible month/year on change.
- Nav buttons: `aria-label={t.previousMonth}` / `t.nextMonth` / `t.previousYear` / `t.nextYear`.

### Keyboard

| Key                  | Action                                                                |
| -------------------- | --------------------------------------------------------------------- |
| Arrow Left / Right   | Previous / next day (logical — RTL-aware).                            |
| Arrow Up / Down      | Previous / next week (-7 / +7 days).                                  |
| PageUp / PageDown    | Previous / next month.                                                |
| Shift + PageUp/Down  | Previous / next year.                                                 |
| Home / End           | First / last day of week.                                             |
| Ctrl/Cmd + Home/End  | First / last day of month.                                            |
| Enter / Space        | Select focused day.                                                   |
| Esc                  | Close popover (for DatePicker).                                       |

Focus is roving — only the "focused day" has `tabIndex={0}`; all others `tabIndex={-1}`.

### DatePicker-specific

- Input has `aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`.
- Opening the Popover moves focus into the Calendar (to today, or to current value if set).
- Closing returns focus to the Input.
- Calendar dialog has `aria-label={t.calendarDialog}`.

### Screen-reader

- Selected-day announcement: `t.selectedDayAnnouncement(formattedDate)` via `aria-live`.
- Range-end-selected: `t.rangeEndAnnouncement(formattedStart, formattedEnd)`.

axe-core: 0 violations across all 4 × 7 × 3 = 84 visual cells × {single, range, multiple} × {LTR, RTL}.

---

## Translations (i18n)

New namespace added to `<I18nProvider>`:

```ts
export interface CalendarTranslations {
  // Nav
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  jumpToMonth: string;
  jumpToYear: string;
  today: string;
  // Picker
  openCalendar: string;
  calendarDialog: string;
  clear: string;
  apply: string;
  // Range
  startDate: string;
  endDate: string;
  rangePresetsLabel: string;
  // Announcements
  selectedDayAnnouncement: (formatted: string) => string;
  rangeStartAnnouncement: (formatted: string) => string;
  rangeEndAnnouncement: (start: string, end: string) => string;
  weekNumberHeader: string;
  // Misc
  invalidDate: string;
  outOfRange: string;
}

export const enCalendarTranslations: CalendarTranslations = { /* … */ };
export const heCalendarTranslations: CalendarTranslations = { /* … */ };
export const arCalendarTranslations: CalendarTranslations = { /* … */ };
```

Merge precedence (same as DataGrid / Pagination):
1. `props.translations`
2. `<I18nProvider>` context
3. English defaults

Calendar is **the fourth consumer** of `<I18nProvider>` (after DataGrid, Pagination, Breadcrumbs) — formally confirms it as a load-bearing primitive of the engine.

---

## Recipe Map

```ts
export const calendarRecipes = {
  root: cv({
    base: 'inline-flex flex-col gap-2 p-2 select-none',
    variants: {
      size:    { sm: 'text-xs', md: 'text-sm', lg: 'text-base' },
      variant: { solid: '', outline: 'border rounded-lg', soft: 'bg-bg-subtle rounded-lg', minimal: '' },
    },
  }),
  header:         cv({ base: 'flex items-center justify-between gap-2' }),
  headerTitle:    cv({ base: 'flex items-center gap-1 font-semibold' }),
  navButton:      cv({ base: 'inline-flex items-center justify-center rounded-md hover:bg-bg-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring', variants: { size: { sm: 'size-6', md: 'size-7', lg: 'size-8' } } }),
  monthsRow:      cv({ base: 'flex gap-4', variants: { orientation: { horizontal: 'flex-row', vertical: 'flex-col' } } }),
  month:          cv({ base: 'flex flex-col gap-1' }),
  weekdaysRow:    cv({ base: 'grid grid-cols-7 gap-0 text-fg-muted', variants: { showWeekNumbers: { true: 'grid-cols-8', false: 'grid-cols-7' } } }),
  weekday:        cv({ base: 'flex items-center justify-center font-medium', variants: { size: { sm: 'size-7 text-xs', md: 'size-9 text-xs', lg: 'size-11 text-sm' } } }),
  weeksGrid:      cv({ base: 'grid', variants: { showWeekNumbers: { true: 'grid-cols-8', false: 'grid-cols-7' } } }),
  weekNumberCell: cv({ base: 'flex items-center justify-center text-fg-muted text-xs' }),
  day:            cv({
    base: 'relative flex items-center justify-center rounded-md transition-colors duration-fast focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
    variants: {
      size:    { sm: 'size-7 text-xs', md: 'size-9 text-sm', lg: 'size-11 text-base' },
      variant: { solid: '', outline: '', soft: '', minimal: '' },
      color:   { primary: '', /* …6… */ },
      state:   {
        default:      'cursor-pointer hover:bg-bg-subtle',
        today:        'font-bold ring-1 ring-fg-muted',
        selected:     '',
        rangeStart:   'rounded-e-none',
        rangeMiddle:  'rounded-none',
        rangeEnd:     'rounded-s-none',
        rangePreview: 'rounded-none opacity-60',
        outside:      'text-fg-muted opacity-40',
        disabled:     'opacity-30 line-through pointer-events-none',
      },
    },
    compoundVariants: [
      // 28 cells × 6 selected/range states = ~168 compounds; collapse with shared "selected" styling
      { variant: 'solid', color: 'primary', state: 'selected', class: 'bg-primary-solid text-fg-inverted' },
      { variant: 'solid', color: 'primary', state: 'rangeStart', class: 'bg-primary-solid text-fg-inverted rounded-e-none' },
      { variant: 'solid', color: 'primary', state: 'rangeMiddle', class: 'bg-primary-subtle' },
      /* …complete matrix in implementation… */
    ],
  }),
};

export const datePickerRecipes = {
  trigger: cv({ /* the icon button appended to <Input> */ }),
  presetList: cv({ base: 'flex flex-col gap-1 p-2 border-e border-border', variants: { /* … */ } }),
  presetItem: cv({ base: 'px-3 py-1.5 rounded-md text-start hover:bg-bg-subtle' }),
  applyBar: cv({ base: 'flex justify-between items-center gap-2 pt-2 border-t border-border' }),
};
```

---

## Animation

- Day hover: `transition-colors duration-fast`.
- Month-change slide (optional, opt-in via `animateMonthChange={true}`): 200ms `ease-emphasized` horizontal slide. Off by default to avoid jank for keyboard nav.
- Popover open/close: inherits `<Popover>`'s motion.
- Range hover-preview: opacity transition only (no layout shift).
- `prefers-reduced-motion`: all transitions clamped to opacity at ≤ 80ms.

---

## Performance Targets

| Scenario                                | Target                                |
| --------------------------------------- | ------------------------------------- |
| Calendar single-month initial render     | < 8ms                                 |
| Day hover (range mode, with preview)     | < 4ms re-render                       |
| Month change (prev/next)                 | < 12ms                                |
| Year jump (12 months recomputed)         | < 30ms                                |
| Two-month range picker initial render    | < 16ms                                |

Achieved via memoized `computeMonthGrid` (keyed by `(monthIso, locale, weekStartsOn, fixedWeeks, showOutsideDays)`). Day cells use `React.memo` with stable props from `useCalendar`.

---

## Testing

- Pure (`dateMath.test.ts`): exhaustive — every helper × edge cases (leap year, DST, year-boundary, month-boundary, negative `n`).
- Pure (`computeMonthGrid.test.ts`): each locale (en-US, en-GB, de-DE, he-IL, ar-EG, ja-JP) renders the expected grid for a known reference month.
- Pure (`parseDateFormat.test.ts`): permissive parser round-trips, locale month-name parsing, two-digit year pivot.
- Integration (Calendar): mode switching, keyboard nav (all 11 bindings), range hover-preview, min/max clamping, isDateDisabled predicate, locale weekday names.
- Integration (DatePicker): typed input → calendar updates; calendar select → input updates; Popover open/close + focus management.
- Integration (DateRangePicker): two-month, range hover, preset application.
- A11y: ARIA grid pattern, focus management on open/close, screen-reader announcements, axe across the 84-cell matrix × 3 modes.
- RTL: visual snapshots in Hebrew + Arabic.
- Bundle target: **Calendar ~6 KB gz · DatePicker +2 KB gz · DateRangePicker +1 KB gz · ≈ 9 KB gz total** (excluding `Intl` which is platform).

---

## Acceptance Criteria

- [x] `<Calendar>` standalone (inline) works with `single` / `multiple` / `range` modes.
- [x] `<DatePicker>` and `<DateRangePicker>` wrap Calendar in Popover + Input.
- [x] Locale-aware weekday/month names + first-day-of-week (RTL visual audit deferred to PR 6).
- [x] Custom `format` token parser + formatter.
- [x] Hidden `<input type="hidden">` carries ISO-8601 value for forms.
- [x] Range hover-preview during selection.
- [x] `presets` apply current values via lazy `range()` fn.
- [x] Full W3C Date Picker Dialog keyboard pattern.
- [ ] axe-core: 0 violations across the variant × color × size × mode × {LTR, RTL} matrix. _(deferred to PR 7)_
- [x] `<I18nProvider>` integration shipped; default English bundle in place. Hebrew + Arabic bundles deferred to PR 6.
- [x] Pure date math (no external date lib).
- [ ] All 12 `dateMath` helpers at 100% line coverage. _(test suite deferred to PR 7)_
- [ ] Bundle ≈ 9 KB gz total. _(benchmark deferred to PR 7)_
- [x] No layout shift between months when `fixedWeeks={true}`.

---

## DRY Self-Check

- [ ] No external date library (`date-fns` / `dayjs` / `luxon`) — uses `Intl` + local math.
- [ ] `useCalendar` is the single state machine — DatePicker / DateRangePicker compose it via the same hook.
- [ ] Reuses `<Popover>` for the overlay (no new floating logic).
- [ ] Reuses `<Input>` for the trigger field (no new input chrome).
- [ ] Reuses `<Slot>` (Phase 3) for `asChild` on the trigger.
- [ ] Reuses `useFormFieldA11y` for hint/error wiring on DatePicker.
- [ ] Reuses `<I18nProvider>` (no parallel translation system).
- [ ] `computeMonthGrid`, `dateMath`, `parseDateFormat`, `formatDate` are pure — testable without DOM.

---

## Suggested PR Split

| PR | Scope                                                            | LoC    | Status   |
| -- | ---------------------------------------------------------------- | ------ | -------- |
| 1  | `dateMath` helpers (+ pure tests deferred to PR 7)               | ~ 300  | Shipped  |
| 2  | `useCalendar` + `computeMonthGrid` (+ pure tests deferred to PR 7) | ~ 600  | Shipped  |
| 3  | `<Calendar>` DOM + recipes + keyboard                            | ~ 900  | Shipped  |
| 4  | `<DatePicker>` + `parseDateFormat` + presets                     | ~ 700  | Shipped  |
| 5  | `<DateRangePicker>` + two-month layout                           | ~ 500  | Shipped  |
| 6  | RTL audit + locale bundles (Hebrew / Arabic) + announcements     | ~ 400  | Pending  |
| 7  | Polish + tests + docs + axe + visual snapshots + perf benchmark  | ~ 500  | Pending  |

Total: ~ 3,900 LoC including tests. Tier 2.5 — about half the size of DataGrid.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/33-date-picker.md`.
2. Append `## Outcome`: bundle delta, locale coverage, deviations, follow-ups.
3. Unblocks future TimePicker / DateTimePicker / Scheduling primitives — all of which can consume `useCalendar` + `dateMath`.
4. `<Calendar>` is now available as a DataGrid column filter for `type: 'date'` columns — file a follow-up to replace the V1 native `<input type="date">` filter with `<Calendar>` inside a Popover.
5. **Phase 58 Scheduler (Tier 3 — Google-Calendar-parity component, sibling to DataGrid)** is the largest downstream consumer of this phase: it reuses `useCalendar` for its sidebar `<Scheduler.MiniMonth>`, reuses `dateMath` wholesale for view-range computation + recurrence + drag math + holidays, and consumes the same `<I18nProvider>` namespace for locale-aware month / weekday / time formatting. If anything is missing from `useCalendar` / `dateMath` during Scheduler implementation, add it here (not in Scheduler) — the dependency arrow points one way.