# APX DS — Master Plan

> Status: Phases 1–6 + 7 (Input) + 8 (Textarea) + 9 (Checkbox) + 10 (Switch) + 11 (Radio) + 12 (Badge) + 13 (Avatar) + 14 (Card) + 15 (Alert) + 24 (Progress) shipped · 25 / 26 in progress · 16 pending · Batch 2 (Phases 17–26) planned & Pending · **Phase 27 (DataGrid, Tier 3) ✅ Shipped — all 8 PRs landed 2026-05-26** · Batch 3 (Phases 28–32) planned & Pending **(Phase 31 Pagination ✅ Shipped — second consumer of `<I18nProvider>`; DataGrid pagination delegated)** · Batch 4 (Phases 33–36) planned & Pending · **Batch 5 (Phases 37–43) planned & Pending** · **Batch 6 (Phases 44–48) planned & Pending** · **Batch 7 (Phases 49–55) planned & Pending** · **Phase 56 (Carousel, Tier 2.5) planned & Pending** · **Phase 57 (Icon + IconProvider, Tier 1 — cross-cutting) planned & Pending** · **Phase 58 (Scheduler, Tier 3 — sibling to DataGrid) planned & Pending** · **`useRovingTabindex` engine RFC (under `pending/core/`) planning-only** · **`<I18nProvider>` engine RFC (under `pending/core/`) planning-only — 10+ shipped Outcomes consuming hand-rolled `translations` props** · Last updated: 2026-05-26

`apx-ds` is a customizable, themable, RTL-ready, fully overridable React component library.
It ships as a publishable npm package (`apx-ds`) and is developed inside a monorepo that also
houses a custom **renderer** (local docs / preview app) used during development.

This folder contains the **phased build plan**. Each phase is a self-contained markdown document
inside `pending/` that gets moved to `completed/` once it's finished and verified.

---

## Guiding Principles

Every line of code in this project must respect these five rules:

1. **DRY** — No duplication. Anything shared (variant logic, token resolution, animation primitives,
   class merging) lives in `@apx-ds/engine` and is imported, never re-implemented.
2. **Overridable at every level** — Theme-level variants change the whole DS at once; per-component
   variant prop overrides for a single instance; arbitrary `className`/`style`/`sx` overrides for
   one-off tweaks. Nothing is hard-locked.
3. **Custom CSS friendly** — Every component accepts `className`, `style`, and a structured `sx`-like
   prop. Internal classes are stable and documented so consumers can target them.
4. **Responsive by default** — Every visual prop accepts either a single value or a responsive
   object (`{ base, sm, md, lg, xl }`). The engine resolves it once into CSS.
5. **Animatable** — Components expose motion hooks/props. Sensible animation defaults come from the
   theme's `motion` tokens (duration, easing). Consumers can disable, override, or extend them.

---

## Architecture at a Glance

```
apx-ds/                       # monorepo root
├── packages/
│   ├── engine/                   # @apx-ds/engine — primitives, utilities, types
│   ├── tokens/                   # @apx-ds/tokens — design token definitions
│   ├── theme/                    # @apx-ds/theme  — ThemeProvider, palettes, mode
│   ├── components/               # @apx-ds/components — the actual UI library
│   └── icons/                    # @apx-ds/icons — (future) icon set
├── apps/
│   └── renderer/                 # local dev/preview app (NOT published)
├── plans/                        # this folder
└── package.json                  # workspace root
```

The **published** package surface is the union of `engine + tokens + theme + components`, re-exported
from a single root entry point — so consumers write:

```ts
import { ThemeProvider, Button, defineTheme } from 'apx-ds';
```

…and never need to know about the internal package boundary.

---

## Phase Order

Each phase has its own document in `pending/` (or `completed/`). Phases are sequential — you should
not start phase N+1 before phase N is verified, because every later phase depends on what came before.

| #   | Phase                       | Goal                                                              | Doc                                                                | Status      |
| --- | --------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ | ----------- |
| 1   | **Infrastructure**          | Monorepo, build pipelines, tooling, scripts, CI-ready             | [`completed/01-infrastructure.md`](completed/01-infrastructure.md) | ✓ Completed |
| 2   | **Engine**                  | Core primitives: variants, tokens, slots, direction, refs, types  | [`completed/02-engine.md`](completed/02-engine.md)                 | ✓ Completed |
| 3   | **Theme Engine**            | `ThemeProvider`, palette light/dark, variant enum, dir, CSS vars  | [`completed/03-theme-engine.md`](completed/03-theme-engine.md)     | ✓ Completed |
| 4   | **Renderer**                | Local dev preview app, README rendering, live examples, switchers | [`completed/04-renderer.md`](completed/04-renderer.md)             | ✓ Completed |
| 5   | **First Component: Button** | Build `<Button>` end-to-end as the reference implementation       | [`completed/05-button.md`](completed/05-button.md)                 | ✓ Completed |
| 5.5 | **Adaptive Variants**       | Rename to `default`/`tetsu`/`origami`; `default` adapts to Safari | [`completed/05-5-adaptive-variants.md`](completed/05-5-adaptive-variants.md) | ✓ Completed |
| 5.6 | **Live Theme Overrides**    | Runtime override layer + Theme Studio (palette/radius/motion + copy-as-code) | [`completed/05-6-theme-overrides.md`](completed/05-6-theme-overrides.md) | ✓ Completed |
| 6   | **Three Button Variants**   | `solid`, `outline`, `ghost` × 7 colors — proving the variant system | [`completed/06-button-variants.md`](completed/06-button-variants.md) | ✓ Completed |
| 7   | **Components Batch 1 — Input**     | Text form primitive; extracts `_shared/controlRecipe` + `useFormFieldA11y` | [`completed/components/07-input.md`](completed/components/07-input.md)   | ✓ Completed |
| 8   | **Components Batch 1 — Textarea**  | Multi-line text; DRY proof of the shared control recipe                    | [`completed/components/08-textarea.md`](completed/components/08-textarea.md) | ✓ Completed |
| 9   | **Components Batch 1 — Checkbox**  | Boolean control; introduces three-slot recipe + hidden-input pattern       | [`in-progress/components/09-checkbox.md`](in-progress/components/09-checkbox.md) | In progress |
| 10  | **Components Batch 1 — Switch**    | On/off toggle; same three-slot recipe + CSS-driven thumb slide             | [`pending/components/10-switch.md`](pending/components/10-switch.md)     | Pending |
| 11  | **Components Batch 1 — Radio**     | `Radio` + `RadioGroup`; context-driven children + roving tabindex          | [`completed/components/11-radio.md`](completed/components/11-radio.md)   | ✓ Completed |
| 12  | **Components Batch 1 — Badge**     | Smallest display primitive; 4 variants × 7 colors stress-test               | [`completed/components/12-badge.md`](completed/components/12-badge.md)   | ✓ Completed |
| 13  | **Components Batch 1 — Avatar**    | User-identity glyph + `AvatarGroup`; image-fallback state machine          | [`in-progress/components/13-avatar.md`](in-progress/components/13-avatar.md) | In progress |
| 14  | **Components Batch 1 — Card**      | First compound component; establishes `Object.assign` namespace pattern    | [`pending/components/14-card.md`](pending/components/14-card.md)         | Pending |
| 15  | **Components Batch 1 — Alert**     | Status banner; introduces `_shared/iconForColor` + Motion exit animation   | [`in-progress/components/15-alert.md`](in-progress/components/15-alert.md) | In progress |
| 16  | **Components Batch 1 — Tabs**      | Navigation primitive; CSS-only indicator + full ARIA Tabs keyboard pattern | [`completed/components/16-tabs.md`](completed/components/16-tabs.md)     | ✓ Completed |
| 17  | **Components Batch 2 — Tooltip**   | First positioning-engine consumer; pure read-only overlay                  | [`pending/components/17-tooltip.md`](pending/components/17-tooltip.md)   | Pending |
| 18  | **Components Batch 2 — Popover**   | Interactive floating panel; focus trap + outside-click                     | [`pending/components/18-popover.md`](pending/components/18-popover.md)   | Pending |
| 19  | **Components Batch 2 — Modal**     | Centered blocking overlay; Header/Body/Footer compound + scroll lock       | [`pending/components/19-modal.md`](pending/components/19-modal.md)       | Pending |
| 20  | **Components Batch 2 — Drawer**    | Edge-anchored sliding panel; DRY proof of Modal's pattern                  | [`pending/components/20-drawer.md`](pending/components/20-drawer.md)     | Pending |
| 21  | **Components Batch 2 — Toast**     | Imperative `toast()` API + `<Toaster />` queue; promise integration        | [`pending/components/21-toast.md`](pending/components/21-toast.md)       | Pending |
| 22  | **Components Batch 2 — Menu**      | Dropdown + context menu via `trigger` prop; submenus + keyboard nav        | [`pending/components/22-menu.md`](pending/components/22-menu.md)         | Pending |
| 23  | **Components Batch 2 — Select**    | Form combobox; cross-cutting form-control + overlay primitives             | [`pending/components/23-select.md`](pending/components/23-select.md)     | Pending |
| 24  | **Components Batch 2 — Progress**  | `<Progress />` + `<CircularProgress />`; CSS-only animations; no engine dep| [`pending/components/24-progress.md`](pending/components/24-progress.md) | Pending |
| 25  | **Components Batch 2 — Skeleton**  | Loading placeholder + `<SkeletonText>` + `<SkeletonAvatar>`; no engine dep | [`pending/components/25-skeleton.md`](pending/components/25-skeleton.md) | Pending |
| 26  | **Components Batch 2 — Accordion** | Disclosure list; CSS-grid open/close transition; no engine dep             | [`pending/components/26-accordion.md`](pending/components/26-accordion.md)| Pending |
| 27  | **DataGrid (complex / Tier 3)**    | Production-grade datagrid: filtering, sorting, selection, pagination, resize/pin/visibility, expansion, cell editing, aggregations, virtualization, CSV/JSON export, localStorage state, **i18n** (en/he/ar shipped), **RTL** first-class. Establishes engine `<I18nProvider>`. | [`completed/components/27-data-grid.md`](completed/components/27-data-grid.md) | ✓ Completed |
| 28  | **Components Batch 3 — Slider**    | Single + range; horizontal + vertical; marks; value bubble; W3C Slider pattern   | [`pending/components/28-slider.md`](pending/components/28-slider.md) | Pending |
| 29  | **Components Batch 3 — NumberInput** | Typed `number \| null` value; locale-aware parse/format (incl. Arabic-Indic digits); stepper buttons with mouse-hold accelerating repeat | [`pending/components/29-number-input.md`](pending/components/29-number-input.md) | Pending |
| 30  | **Components Batch 3 — Toggle / ToggleGroup** | Pressed-state button + single/multi groups; `attached` segmented styling; reuses `buttonRecipe` | [`pending/components/30-toggle-group.md`](pending/components/30-toggle-group.md) | Pending |
| 31  | **Components Batch 3 — Pagination** | Page + cursor modes; `computePageWindow` truncation; consumes engine `<I18nProvider>`; refactors DataGrid pagination | [`completed/components/31-pagination.md`](completed/components/31-pagination.md) | ✓ Completed |
| 32  | **Components Batch 3 — Breadcrumbs** | Array + compound APIs; custom separators; overflow collapse via `<Menu>`; polymorphic via `<Slot>` | [`completed/components/32-breadcrumbs.md`](completed/components/32-breadcrumbs.md) | ✓ Completed |
| 33  | **Components Batch 4 — Calendar + DatePicker + DateRangePicker (Tier 2.5)** | Pure `Intl` date math (no external date lib); single/multiple/range modes; locale-aware weekday + first-day-of-week + RTL; preset shortcuts; `<I18nProvider>` consumer #4 | [`pending/components/33-date-picker.md`](pending/components/33-date-picker.md) | Pending |
| 34  | **Components Batch 4 — Combobox + MultiCombobox** | Searchable single/multi select; static + async options (`loadOptions` w/ debounce + abort); creatable; grouped; virtualization; ARIA combobox pattern w/ `aria-activedescendant` | [`pending/components/34-combobox.md`](pending/components/34-combobox.md) | Pending |
| 35  | **Components Batch 4 — CommandPalette + Kbd (Tier 2.5)** | ⌘K launcher: 3 registration APIs (declarative / hook / imperative), sub-pages, async commands, global hotkey, recent + suggested. Ships `<Kbd>` primitive alongside | [`pending/components/35-command-palette.md`](pending/components/35-command-palette.md) | Pending |
| 36  | **Components Batch 4 — FileUpload + Dropzone** | Drag-drop + click-browse, parallel upload queue w/ retry/cancel, per-file progress, paste-to-upload, auto-revoking preview URLs, consumer-provided uploader | [`completed/components/36-file-upload.md`](completed/components/36-file-upload.md) | ✓ Completed |
| 37  | **Components Batch 5 — Stack + HStack + VStack + Spacer** | Pure flex layout primitives; responsive direction/align/justify/gap; auto-divider insertion between children; `as` + `asChild` polymorphism | [`pending/components/37-stack.md`](pending/components/37-stack.md) | Pending |
| 38  | **Components Batch 5 — Divider** | Horizontal + vertical + labeled (pseudo-element rules); RTL via `border-inline-start`; replaces inline `<hr className="border-t…">` everywhere | [`pending/components/38-divider.md`](pending/components/38-divider.md) | Pending |
| 39  | **Components Batch 5 — Spinner** | Standalone loading primitive; 3 variants (ring / dots / pulse); pure CSS; respects reduced-motion; replaces inline spinners in Button + Toast | [`pending/components/39-spinner.md`](pending/components/39-spinner.md) | Pending |
| 40  | **Components Batch 5 — Stat + StatGroup** | Dashboard metric tile with label/value/delta/caption; `Intl.NumberFormat` for currency/percent/compact; `delta.inverse` for churn-style metrics; prop-driven + compound API | [`pending/components/40-stat.md`](pending/components/40-stat.md) | Pending |
| 41  | **Components Batch 5 — Stepper** | Multi-step progress indicator; horizontal + vertical; 5 step statuses; clickable + linear modes; numbered / dots / progress variants; i18n | [`completed/components/41-stepper.md`](completed/components/41-stepper.md) | ✓ Completed |
| 42  | **Components Batch 5 — EmptyState** | "No data" / "no results" / "error" / "loading" / "success" layout; prop-driven + compound API; slot content for DataGrid / FileUpload / Combobox | [`pending/components/42-empty-state.md`](pending/components/42-empty-state.md) | Pending |
| 43  | **Components Batch 5 — Rating** | Star (or any glyph) rating form control; interactive + read-only; 1 / 0.5 / exact precision; W3C Slider keyboard; RTL pointer math; hidden-input form integration | [`pending/components/43-rating.md`](pending/components/43-rating.md) | Pending |
| 44  | **Components Batch 6 — Toolbar + Group + Separator + Spacer** | W3C Toolbar pattern with roving tabindex; horizontal + vertical; bordered / floating variants; ResizeObserver-based overflow → "more" Menu collapse; opt-in auto-Tooltip wrapping for iconic children | [`pending/components/44-toolbar.md`](pending/components/44-toolbar.md) | Pending |
| 45  | **Components Batch 6 — Timeline** | Vertical / horizontal / alternating; 5 tones × `active` emphasis; `Intl.RelativeTimeFormat` for "5 minutes ago" / "vor 3 Tagen"; activity feed + order tracking + roadmap patterns | [`pending/components/45-timeline.md`](pending/components/45-timeline.md) | Pending |
| 46  | **Components Batch 6 — TreeView (Tier 2.5)** | Full W3C TreeView keyboard pattern (arrow nav, type-to-search, `*` expand-all); single + multi-select; async `loadChildren`; opt-in virtualization for 10k+ nodes; HTML5 DnD with WCAG 2.2 keyboard drag mode | [`pending/components/46-tree-view.md`](pending/components/46-tree-view.md) | Pending |
| 47  | **Components Batch 6 — ColorPicker + ColorSwatch + ColorInput (Tier 2.5)** | Saturation/Value square + hue + alpha sliders (Slider reuse); hex / RGB / HSL tabbed input; preset grid; opt-in EyeDropper API; opt-in WCAG contrast chip; pure `_shared/color.ts` (~100 LoC, no `tinycolor2`) | [`pending/components/47-color-picker.md`](pending/components/47-color-picker.md) | Pending |
| 48  | **Components Batch 6 — TagsInput** | Multi-value free-form input; per-tag `validate`; paste-multi-token via `splitOn` (string[] / RegExp); sync + async suggestions via Combobox-style listbox + `useDeferredFilter`; tag-cursor keyboard mode; hidden inputs for form submit | [`pending/components/48-tags-input.md`](pending/components/48-tags-input.md) | Pending |
| 49  | **Components Batch 7 — Field** (+ Label/Description/Helper/Error/Control) | Form-field composition wrapper above every form control; 4 label positions (top/start/floating CSS-only/hidden); `required`/`optional`/`error`/`description`/`helperText`/`fieldset`; integrates with all 13 form controls via FieldContext **with zero source-code changes** to those controls | [`completed/components/49-field.md`](completed/components/49-field.md) | ✓ Completed |
| 50  | **Components Batch 7 — Form + FormProvider + useForm() (Tier 2.5)** | Dependency-free form state engine; `useReducer`-based; per-field + central validators (sync/async with debounce); server-error path; Field auto-binding via FormContext + name; ~3 KB vs Formik's ~13 KB; render-prop + headless hook + element APIs | [`pending/components/50-form.md`](pending/components/50-form.md) | Pending |
| 51  | **Components Batch 7 — AppShell + useAppShell()** | Top-level product layout; header/sidebar/aside/footer + main; 2 layout variants (`default`/`inset`); rail-mode collapse + auto-Drawer on mobile; skip-to-content link; sidebar `start`/`end` logical positioning | [`pending/components/51-app-shell.md`](pending/components/51-app-shell.md) | Pending |
| 52  | **Components Batch 7 — NavigationMenu (Tier 2.5)** | Top-nav with dropdowns + mega-menus; W3C Menubar keyboard pattern; animated single-indicator slide between items; hover-with-delay + click triggers (`trigger="both"`); router integration via `<NavigationMenu.Link asChild>` | [`pending/components/52-navigation-menu.md`](pending/components/52-navigation-menu.md) | Pending |
| 53  | **Components Batch 7 — Sidebar** (+ Header/Section/Item/SubItems/Spacer/Footer) | Vertical app nav rail inside AppShell; rail-mode auto-Tooltip wrapping; collapsible Sections + expandable Items (Accordion mechanics); `isActiveHref` exact/prefix matching; Badge counts; router integration via `asChild` | [`pending/components/53-sidebar.md`](pending/components/53-sidebar.md) | Pending |
| 54  | **Components Batch 7 — HoverCard** | Rich hover-triggered overlay (GitHub @mention card pattern); reuses Popover positioning; "bridge" trigger→content traversal; `trigger="hover-focus"` for keyboard a11y; configurable open/close delays; no focus trap (additive content) | [`pending/components/54-hover-card.md`](pending/components/54-hover-card.md) | Pending |
| 55  | **Components Batch 7 — Table** (+ Head/Body/Row/Cell/HeaderCell/Foot/Caption) | Lightweight semantic `<table>` wrapper (~4 KB) below DataGrid (~9 KB); compound + declarative APIs; single-column sort (string/number/date/custom); selection (single/multi) + row actions slot; sticky header CSS-only; striped/bordered/hoverable variants | [`pending/components/55-table.md`](pending/components/55-table.md) | Pending |
| 56  | **Carousel (Tier 2.5)** (+ Viewport/Track/Slide/PrevButton/NextButton/Indicators/AutoplayControl/Controls/LiveRegion) | Pure CSS scroll-snap engine + thin JS coordination — **zero new deps** (no Embla/Swiper); autoplay OFF by default with always-visible pause/play when enabled (WCAG 2.2.2); opt-in loop via clone-bracketing; horizontal + vertical; responsive `slidesPerView` + `gap`; W3C APG keyboard pattern; live-region announcements gated to manual / paused-autoplay; reduced-motion auto-pauses autoplay; smart-default rendering (Viewport/Track/Controls/Indicators auto-wrap) | [`completed/components/56-carousel.md`](completed/components/56-carousel.md) | ✓ Completed (SDS-Agent8) |
| 57  | **Icon + IconProvider (Tier 1, cross-cutting)** (+ `createIconRegistry` + `useIconRegistry` + `DS_ICON_NAMES`) | The DS Icon primitive — **library-agnostic** (works with lucide / heroicons / radix-icons / iconify / inline SVG); three coexisting modes (`as` static / `name` registry / `children` inline); decorative-by-default a11y (auto `aria-hidden`, opt-in `label` makes meaningful); size inherits 1em / color inherits currentColor; `rotate` / `flip` / `spin` utility props; documented stable `DS_ICON_NAMES` catalog typed `as const`; strict-mode registry validation. **Closes the gap multiple shipped phases flagged** (EmptyState Outcome, etc.). No breaking changes to existing components | [`pending/components/57-icon.md`](pending/components/57-icon.md) | Pending |
| 58  | **Scheduler (complex / Tier 3)** (+ `<Scheduler.Toolbar>` / `Sidebar` / `Viewport` / `MiniMonth` / `CalendarList` / `ResourceTree` / `HolidayToggle` / `QuickPopover` / `EventModal` / `MobileSheet` / `EventCard` / `NowIndicator` / `AllDayBand` / `ConflictOverlay` + `useScheduler()`) | **Google-Calendar-parity scheduler.** Eight views (Month / Week / WorkWeek / Day / MultiDay / Agenda / Year / Resource swimlanes). Hour-grid timeline w/ drag-create / drag-move / drag-resize / snap-to-grid / overlap-packing / current-time line / all-day band / business-hours shading. Resource swimlane view with grouped tree + horizontal scroll virtualization. CRUD via `readOnly` / per-event `editable` predicate + optimistic patches + conflict detection. Google-Calendar-style quick-create popover (Event/Task/Appointment tabs + date-time + Add-guests/location/description + More options + Save). Full event editor Modal with recurrence (RRULE-lite: daily/weekly/monthly/yearly + interval + byDay + until + count + exceptions + this/this-and-following/all edit scope), reminders, attendees, visibility, status. Holidays via list / provider / built-in ~20-locale defaults; filterable by region. Filters (calendars / resources / search / dateRange / holidays / custom). Toolbar with prev/next/today/view-switcher/search/filters/density/settings. Locale + RTL first-class; Hijri formatting via `Intl`. Consumes Phase 33 Calendar + 18 Popover + 19 Modal + 20 Drawer + 22 Menu + 23 Select + 30 ToggleGroup + 17 Tooltip + 34 Combobox + 48 TagsInput + 55 Table + 46 TreeView + 49 Field + 9 Checkbox + 12 Badge + 14 Card + `<I18nProvider>`. **No external date / scheduling library** — pure `Intl` + ~150 LoC `recurrence.ts` + reuses Phase 33's `dateMath.ts`. ~11k LoC, suggested 9 PRs. **Sibling Tier 3 to Phase 27 DataGrid.** | [`pending/components/58-scheduler.md`](pending/components/58-scheduler.md) | Pending |
| — (engine RFC) | **`useRovingTabindex` (engine promotion RFC, Tier 1 — under `pending/core/`)** | Coordinated extraction of the roving-tabindex pattern from 3 shipped impls (Tabs registry + Radio registry + Toolbar DOM-walk) into `@apx-ds/engine/keyboard`. Two cooperating sub-hooks — `useRovingTabindexRegistry` for context-tracked items, `useRovingTabindexDom` for arbitrary children — sharing a pure `resolveRovingNextIndex` resolver. 4-PR migration plan with each consumer's full test suite as the regression gate. Triggered by @SDS-Agent2's Toolbar Outcome flagging the threshold. **Planning-only; no implementation green-light yet** | [`pending/core/01-use-roving-tabindex.md`](pending/core/01-use-roving-tabindex.md) | Pending |
| — (engine RFC) | **`<I18nProvider>` + `useI18n()` (engine i18n primitive RFC, Tier 1 — under `pending/core/`)** | Tiny `Intl`-backed i18n primitive consolidating the hand-rolled `translations` prop pattern that **10+ shipped Outcomes** already flagged as deferred (Stepper, Rating, Breadcrumbs, Tabs, Combobox, TagsInput, Field, AppShell, CommandPalette, Table). `<I18nProvider locale messages>` + `useI18n()` exposing `{ t, tn, locale, dir, formatters }` (number / date / relativeTime / list / collator / plural — all via browser `Intl.*`, zero new deps). Auto-derives `dir` from locale (he/ar/fa/ur → rtl). `createMessageBundle()` helper for per-component default `en`/`he`/`ar` bundles. Bundle target: < 2 KB gz. Migration is opt-in & additive per component; `props.translations` continues to win; no provider = today's behavior. **Unblocks Phase 33 DatePicker (locale month / weekday names) + Phase 27 DataGrid (sort/empty/pagination strings) + Phase 47 ColorPicker (channel labels)**. **Planning-only; no implementation green-light yet** | [`pending/core/02-i18n-provider.md`](pending/core/02-i18n-provider.md) | Pending |

> Components Batches 1 + 2 overview: [`pending/components/README.md`](pending/components/README.md).
> Self-contained component plans — each plan owns its own variant matrix (deliberately the opposite
> of how Phase 6 split Button's variants into a separate phase doc).
>
> **Batch 2 prerequisite**: phases 17–23 all consume a small positioning-engine sub-phase
> (`@apx-ds/engine/positioning` + `<Portal>` + `useFocusTrap` + `escape-stack` + `useOutsideClick` + `useScrollLock`). Authored as a core phase:
> [`pending/core/17-positioning-engine.md`](pending/core/17-positioning-engine.md). Phases 24–26 are
> independent and can ship in parallel.

---

## Key Concepts

### ThemeProvider Shape

```ts
<ThemeProvider
  theme={{
    palette: {
      light: { /* component colors */ },
      dark:  { /* component colors */ },
    },
    mode: 'light' | 'dark' | 'system',
    dir:  'ltr' | 'rtl',
    variant: 'default' | 'tetsu' | 'origami' | 'katana' | string, // extensible; `default` is adaptive
    typography: { /* … */ },
    spacing: /* … */,
    radius:  /* … */,
    shadows: /* … */,
    motion:  { duration, easing },
    breakpoints: { sm, md, lg, xl, '2xl' },
  }}
>
  {children}
</ThemeProvider>
```

### Override Layers (highest → lowest precedence)

```
1. Inline `style` prop           (specific instance, escape hatch)
2. `className` prop              (specific instance)
3. `sx` prop (theme-aware)       (specific instance, token-aware)
4. Component-level `variant` prop (specific instance, picks a recipe)
5. Theme-level `variant` setting  (global default for that recipe)
6. Component's own default       (built-in fallback)
```

### Smart Color Constraint Handler (Future / Phase 7+)

A planned subsystem that:

- Detects WCAG contrast violations between paired tokens (e.g., `primary.main` vs `primary.contrast`)
- Auto-suggests adjusted hues that keep brand identity while passing AA / AAA
- Warns in dev mode, no-ops in prod
- Optional: can auto-patch palettes during build

Tracked separately — not part of the initial six phases.

---

## Working Convention

- Each phase doc has: **Objective**, **Deliverables**, **File-level tasks**, **Acceptance criteria**.
- When a phase is verified done: move its `.md` from `pending/` → `completed/` with a `## Outcome`
  appended (what shipped, what was deferred, known issues).
- Sub-phases or unexpected work get appended to the doc as `## Addendum` rather than creating new files.
- Decisions that affect multiple phases get logged in `plans/decisions.md` (ADR-style — TBD).

---

## Tech Stack Snapshot

| Concern         | Choice                                                                | Why                                          |
| --------------- | --------------------------------------------------------------------- | -------------------------------------------- |
| Language        | TypeScript (strict)                                                   | Type safety for consumers                    |
| Package manager | **pnpm**                                                              | Fast, disk-efficient, best workspace support |
| Monorepo tool   | **Turborepo**                                                         | Cached builds, task graph                    |
| Styling         | **Tailwind v4 + CSS Variables + custom variant engine**               | Theming via CSS vars, no runtime cost        |
| Variants        | Custom (CVA-inspired, in `@apx-ds/engine`)                        | DRY, theme-aware, extensible                 |
| Class merge     | **tailwind-merge + clsx**                                             | Avoid conflicts, allow overrides             |
| Animation       | **Motion** (`motion/react`) + CSS transitions                         | Best React DX, mini bundle option            |
| Component build | **tsup** (esbuild)                                                    | Fast, zero-config, ESM+CJS+dts               |
| Renderer        | **Next.js 15 (App Router)** + MDX                                     | Can grow into the public docs site           |
| Code highlight  | **Shiki**                                                             | VS Code themes, build-time                   |
| Testing         | **Vitest** + **@testing-library/react** + **Playwright** (e2e/visual) | Modern, fast                                 |
| Lint/Format     | **ESLint flat config**, **Prettier**                                  | Standard                                     |
| Versioning      | **Changesets**                                                        | Multi-package release management             |

---

## What's Next

The initial six-phase build is **complete**. The DS now has:

- A monorepo + build pipeline (Phase 1).
- An engine of variant / token / slot / direction / motion / color primitives (Phase 2).
- A theme engine with `ThemeProvider`, light + dark palettes, four theme variants, RTL, and
  CSS-variable plumbing (Phase 3).
- A live renderer with MDX docs, examples, props tables, and search (Phase 4).
- A reference `<Button>` exercising every system end-to-end (Phase 5).
- Adaptive variants (`default` adapts Apple ↔ default flavour at runtime), plus `tetsu`,
  `origami`, `katana` (Phase 5.5).
- A runtime override layer with a live **Theme Studio** drawer — palette / radii / motion
  edits stream into all components and can be copied as a `defineTheme({…})` snippet
  (Phase 5.6).
- All three button variants (`solid` / `outline` / `ghost`) for all seven colors (Phase 6).

**Components Batch 1** (Phases 7–16) is planned: ten self-contained component plans live under
[`pending/components/`](pending/components/), each owning its own variant matrix (the deliberate
contrast with Phase 6's split-out variant doc). Build order — Input → Textarea → Checkbox → Switch →
Radio → Badge → Avatar → Card → Alert → Tabs — is sequential because each component contributes a
pattern the later ones reuse (the shared form-control recipe, the three-slot indicator pattern, the
`Object.assign` compound namespace, the `iconForColor` map, the CSS-only active indicator).

**Components Batch 2** (Phases 17–26) is also planned: ten more self-contained plans in the same
folder, focused on overlays + a few independents:

- **Overlays (17–22)**: Tooltip → Popover → Modal → Drawer → Toast → Menu. All consume a small
  positioning-engine sub-phase (Floating UI integration + `<Portal>` + `useFocusTrap` + escape-stack)
  that must ship before phase 17.
- **Cross-cutting form-control overlay (23)**: Select — proves Batch 1's `_shared/` form-control
  primitives + Batch 2's positioning engine compose cleanly.
- **Independents (24–26)**: Progress / Skeleton / Accordion — deliberately don't need the positioning
  engine, so an idle agent can ship them in parallel with the positioning prereq work.

After both batches:

1. **`<Field>` wrapper** — label + helper + error composition that consumes the form-control trio.
2. **Positioning engine sub-phase** — `usePosition` + `<Portal>` + `useFocusTrap` + `escape-stack`
   in `@apx-ds/engine`, authored as `plans/pending/core/17-positioning-engine.md` (TBD).
3. **Smart color constraint handler** — flag low-contrast role pairs at dev time, optionally auto-patch.
4. **First publish** — Changesets + npm `0.1.0`.

That brings the DS to roughly feature-parity with the first public release of MUI Joy / Radix
Themes / Mantine — at which point Batch 3 (Combobox, MultiSelect, DatePicker, Slider, Pagination,
Breadcrumb, etc.) is the logical next slice.
