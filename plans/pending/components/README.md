# Components Batches 1–7 + DataGrid + Carousel + Icon — Fifty-One Component Plans

> Status: **Pending** · Depends on: Phase 6 (Button variants finalized) · Blocks: nothing past these two batches

This folder ships the **post-Button components**, split across two batches. Each plan is
**self-contained**: the variant matrix lives inside the component's own file rather than getting
promoted to a separate phase doc (the deliberate contrast with `06-button-variants.md`). One file =
one component = component code + recipe + variant design + tests + examples.

The Button proved the conventions. These twenty components apply them — copy-paste-modify from the
Button template — and only diverge where the component's job genuinely requires it.

---

## Batch 1 — Form / Display / Layout / Feedback / Navigation

The first ten primitives. **No floating-UI / positioning engine required** — anything that needs to
be anchored to another element ships in Batch 2.

Numbered to continue Phase 6 (`06-button-variants.md`). Build them in order; each subsequent plan
assumes the engine / recipe patterns established by the earlier ones.

| #   | Component        | Slot in the DS              | Doc                                  | Status  |
| --- | ---------------- | --------------------------- | ------------------------------------ | ------- |
| 07  | **Input**        | Text form primitive         | [`07-input.md`](07-input.md)         | Pending |
| 08  | **Textarea**     | Multi-line form primitive   | [`08-textarea.md`](08-textarea.md)   | Pending |
| 09  | **Checkbox**     | Boolean selection control   | [`09-checkbox.md`](09-checkbox.md)   | Pending |
| 10  | **Switch**       | On/off toggle               | [`10-switch.md`](10-switch.md)       | Pending |
| 11  | **Radio**        | Single-of-many selection    | [`11-radio.md`](11-radio.md)         | Pending |
| 12  | **Badge**        | Status / count pill         | [`12-badge.md`](12-badge.md)         | Pending |
| 13  | **Avatar**       | User identity glyph         | [`13-avatar.md`](13-avatar.md)       | Pending |
| 14  | **Card**         | Content container (compound) | [`14-card.md`](14-card.md)          | Pending |
| 15  | **Alert**        | Inline status banner        | [`15-alert.md`](15-alert.md)         | Pending |
| 16  | **Tabs**         | Sectioned navigation        | [`16-tabs.md`](16-tabs.md)           | Pending |

---

## Why these ten, in this order

| Group              | Components                       | What it proves about the DS                                                            |
| ------------------ | -------------------------------- | -------------------------------------------------------------------------------------- |
| Form text          | Input, Textarea                  | Recipe handles border + bg + focus-ring + invalid; same shape works for two surfaces.  |
| Form selection     | Checkbox, Switch, Radio          | Custom-painted controls share a `control + label` slot pattern + indeterminate states. |
| Display primitives | Badge, Avatar                    | 7 colors × N variants matrix works on tiny surfaces; fallback-by-state pattern.        |
| Layout primitive   | Card                             | First compound component (Header/Body/Footer subcomponents).                           |
| Feedback           | Alert                            | Color-mapped iconography + first dismissable interaction (Motion exit).                |
| Navigation         | Tabs                             | First component with internal state, keyboard arrows, and ARIA `tabs` pattern.         |

Floating-UI dependents (Tooltip, Popover, Modal, Select-as-combobox) are **out of scope** for this
batch — they'll land together in a follow-up that introduces the positioning engine.

---

## Shared Conventions (locked-in by Button)

Every plan in this folder assumes these. If a component needs to deviate, the plan calls it out
explicitly under "Deviations from the template" and the deviation is justified.

1. **One styling file per component.** `<Component>.recipe.ts` is the only place class strings live.
2. **One implementation file.** `<Component>.tsx` calls `useThemedClasses({ recipe, componentName, props })` and renders. Zero `cn()` / `clsx` / `tailwind-merge` imports.
3. **`forwardRef` from `@apx-ds/engine`.** Display names are set; refs land on the DOM-y node.
4. **Polymorphism via `Slot`** where the component is "wrap any element" (Card root, Alert root). Form-control components keep native semantics — no `asChild` on Input/Checkbox/etc.
5. **Responsive-aware props.** `variant`, `size`, `color`, `fullWidth` (where applicable) accept `ResponsiveValue<T>`. The recipe handles it.
6. **Theme overrides.** Every component is listed in `theme.components.<Name>.{styleOverrides, defaultProps}` via `useThemedClasses`'s `componentName` argument.
7. **A11y is non-negotiable.** Every plan includes an `<Component>.a11y.test.tsx` running axe + keyboard scenarios. Dev-mode warnings catch missing labels.
8. **Reduced-motion respected.** Any Motion-driven animation pairs with `motion-reduce:` Tailwind utilities and the engine's `useReducedMotion()` hook where needed.
9. **Stable `data-*` hooks.** Each component exposes documented `data-variant`, `data-color`, `data-size`, and state attributes (`data-checked`, `data-indeterminate`, `data-disabled`, `data-invalid`) so consumers can target them from custom CSS.
10. **Examples scaffold the README.** Each component ships a numbered list of `examples/*.tsx` files that the renderer auto-discovers and the MDX embeds via `<ExampleBlock for="…" />`.

---

## DRY Reuse Checklist (cross-component)

Items that should be promoted to the engine / theme **if a second component would need them**:

- [ ] `FormControlContext` — `id`, `name`, `disabled`, `invalid`, `required`, `describedBy` carried from a future `<Field>` wrapper. Stub the context now (Input picks it up); RadioGroup/Checkbox/Switch/Textarea inherit it.
- [ ] `useFormFieldA11y(props)` — a small hook that wires `aria-invalid`, `aria-describedby`, `aria-required`, generates an `id` if missing.
- [ ] `controlRecipe` (shared base) — Input + Textarea + Select share the same shell. Phase 1 of this batch (Input) creates it as `packages/components/src/_shared/controlRecipe.ts`; Textarea (Phase 2) imports it. **Do not** wait until Select to extract — extract on the second consumer.
- [ ] `iconForColor(color)` — Alert and future Toast both need it. Lives in `@apx-dsponents/_shared`.

---

## Batch 2 — Overlays + Disclosure + Loading

Adds the floating-UI surface area plus three independents that don't need positioning. Batch 2 is
**gated on a small engine prerequisite**: a positioning engine (Floating UI integration or a
hand-rolled equivalent) + a `<Portal>` primitive must land before the first overlay consumer
(Tooltip). Plans 17–23 each call this out under "Depends on"; plans 24–26 do not — they can land in
parallel with the positioning-engine work.

| #   | Component   | Floating-UI dep | Doc                                  | Status  |
| --- | ----------- | --------------- | ------------------------------------ | ------- |
| 17  | **Tooltip** | yes — first consumer of the positioning engine | [`17-tooltip.md`](17-tooltip.md)   | Pending |
| 18  | **Popover** | yes             | [`18-popover.md`](18-popover.md)     | Pending |
| 19  | **Modal**   | yes — needs `<Portal>` + focus trap            | [`19-modal.md`](19-modal.md)         | Pending |
| 20  | **Drawer**  | yes             | [`20-drawer.md`](20-drawer.md)       | Pending |
| 21  | **Toast**   | yes — portal + queue                           | [`21-toast.md`](21-toast.md)         | Pending |
| 22  | **Menu**    | yes — dropdown + (optional) context-menu via `trigger` prop | [`22-menu.md`](22-menu.md) | Pending |
| 23  | **Select**  | yes + form-control deps from Batch 1 (`useFormFieldA11y`)   | [`23-select.md`](23-select.md) | Pending |
| 24  | **Progress**  | no — linear + circular indicators            | [`24-progress.md`](24-progress.md)   | Pending |
| 25  | **Skeleton**  | no — loading placeholders                    | [`25-skeleton.md`](25-skeleton.md)   | Pending |
| 26  | **Accordion** | no — disclosure list                         | [`26-accordion.md`](26-accordion.md) | Pending |

---

## Tier 3 — Complex (one-off)

A single deep component that consumes nearly every primitive from Batches 1 + 2 and proves the
system at production scale. Not part of a "batch" — its own phase, planned to span multiple PRs.

| #   | Component     | Notes                                                                                  | Doc                                  | Status  |
| --- | ------------- | -------------------------------------------------------------------------------------- | ------------------------------------ | ------- |
| 27  | **DataGrid**  | Filtering · sorting · selection · pagination · column resize/pin/visibility · row actions · cell editing · expansion · aggregations · virtualization · CSV/JSON export · localStorage state · **i18n** (English / Hebrew / Arabic shipped) · **RTL** first-class. Establishes a new engine `<I18nProvider>` primitive. ~9k LoC, suggested 8 PRs. | [`27-data-grid.md`](27-data-grid.md) | Pending |

---

## Batch 3 — Forms + Navigation (Phases 28–32)

Five mid-complexity primitives that fill the remaining "everyday form + nav" gap. All independent of
each other; most are also independent of the positioning engine. Most can be parallelized across
agents once their direct dependencies (mostly Phase 6 Button + Phase 7 Input) are stable.

| #   | Component             | Dep highlights                                     | Doc                                              | Status  |
| --- | --------------------- | -------------------------------------------------- | ------------------------------------------------ | ------- |
| 28  | **Slider**            | None beyond Button focus tokens; opt-in Tooltip    | [`28-slider.md`](28-slider.md)                   | Pending |
| 29  | **NumberInput**       | Phase 7 Input (`controlBase`, `useFormFieldA11y`)  | [`29-number-input.md`](29-number-input.md)       | Pending |
| 30  | **Toggle / ToggleGroup** | Phase 6 Button (reuses `buttonRecipe`)          | [`30-toggle-group.md`](30-toggle-group.md)       | Pending |
| 31  | **Pagination**        | Phase 6 Button + Phase 23 Select (page-size) + engine `<I18nProvider>` (established by Phase 27); refactors DataGrid to delegate | [`31-pagination.md`](31-pagination.md) | Pending |
| 32  | **Breadcrumbs**       | Phase 6 Button + Phase 3 Slot (asChild) + Phase 22 Menu (overflow) + `<I18nProvider>` | [`32-breadcrumbs.md`](32-breadcrumbs.md) | Pending |

**Batch 3 cross-cutting outcomes:**
- Promotes the engine `<I18nProvider>` from "DataGrid-only" to a general primitive (Pagination is consumer #2, Breadcrumbs is #3).
- DataGrid's bespoke pagination subpart becomes a thin wrapper around `<Pagination />` (~ 300 LoC reduction in Phase 27).
- Toggle establishes the "segmented control" visual that future Toolbar / SegmentedSwitch primitives can consume.
- `useStepperHold` from NumberInput is a reusable mouse-hold repeat-rate hook; future Spinner / Quantity-stepper components can adopt it.

---

## Batch 4 — Advanced Forms + Productivity (Phases 33–36)

Four high-impact additions that complete the form-control coverage and add productivity primitives.
Phase 33 (DatePicker) and Phase 35 (CommandPalette) are Tier 2.5 / complex; Phases 34 + 36 are
Tier 2. All four depend heavily on Batch 2 overlay infrastructure (Modal, Popover, Menu).

| #   | Component                                | Tier   | Dep highlights                                                                                                                                          | Doc                                                  | Status  |
| --- | ---------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | ------- |
| 33  | **Calendar + DatePicker + DateRangePicker** | 2.5 | Phase 7 Input + 18 Popover + 22 Menu + 6 Button + `<I18nProvider>`; **no external date lib** (`Intl` + pure `dateMath.ts`); single phase ships all three | [`33-date-picker.md`](33-date-picker.md)             | Pending |
| 34  | **Combobox + MultiCombobox**             | 2      | Phase 7 Input + 18 Popover + 22 Menu + 23 Select + 12 Badge + `<I18nProvider>`; async loading + creatable + virtualization                              | [`34-combobox.md`](34-combobox.md)                   | Pending |
| 35  | **CommandPalette + Kbd**                 | 2.5    | Phase 19 Modal + 22 Menu + 34 Combobox + `<I18nProvider>`; 3 registration APIs (declarative / hook / imperative); `<Kbd>` ships alongside (< 0.5 KB gz) | [`35-command-palette.md`](35-command-palette.md)     | Pending |
**Batch 4 cross-cutting outcomes:**
- Calendar establishes a pure-`Intl` date-math foundation (`dateMath.ts`, ~12 helpers) — future TimePicker / DateTimePicker / Scheduling primitives consume it without `date-fns` / `dayjs` / `luxon` (~ 30 KB saved).
- `<I18nProvider>` reaches **5 consumers** (DataGrid, Pagination, Breadcrumbs, Calendar, Combobox), confirming it as a load-bearing engine primitive — promote into engine README.
- `useDeferredFilter` (Combobox) and `useUploadQueue` (FileUpload) become reusable infrastructure — async-list and concurrency-capped scheduler patterns.
- `useGlobalHotkey` + `parseHotkey` (CommandPalette) become reusable across the DS — future "shortcut help" and "context menus" can consume them.
- `<Kbd>` ships as a tiny independent primitive — useful in docs, tooltips, menus, and any keyboard-shortcut display.
- After Batch 4, the DS covers **every essential form control**: text, textarea, checkbox, switch, radio, select, combobox, slider, number, toggle group, date picker, file upload.

---

## Batch 5 — Layout + Display + Micro-primitives (Phases 37–43)

Seven primitives that fill the **layout / display / loading / status** gap and one missing form
control (Rating). Most are Tier 1 (tiny, stateless, no overlay deps). Three (`Stat`, `Stepper`,
`Rating`) are Tier 2.

All seven can be parallelized — no interdependencies inside the batch — and most are unblocked
right now (no Batch 2 overlay dependency). A great pool of work to fan out across idle agents.

| #   | Component                                  | Tier   | Dep highlights                                                                                                       | Doc                                              | Status  |
| --- | ------------------------------------------ | ------ | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------- |
| 37  | **Stack + HStack + VStack + Spacer**       | 1      | Phase 3 (`<Slot>`); pure flex layout primitive with responsive direction/align/justify/gap + auto-divider insertion | [`37-stack.md`](37-stack.md)                     | Pending |
| 38  | **Divider**                                | 1      | Phase 3 (`<Slot>`); horizontal + vertical + labeled (pseudo-element rules); used by Stack auto-divider + Menu groups | [`38-divider.md`](38-divider.md)                 | Pending |
| 39  | **Spinner**                                | 1      | None beyond CSS; 3 variants (ring / dots / pulse); replaces inline spinners in Button + CircularProgress + Toast      | [`39-spinner.md`](39-spinner.md)                 | Pending |
| 40  | **Stat + StatGroup**                       | 2      | Phase 5 Text + 14 Icon + 38 Divider + 39 Spinner + `<I18nProvider>`; `Intl.NumberFormat` for currency/percent/compact | [`40-stat.md`](40-stat.md)                       | Pending |
| 41  | **Stepper**                                | 2      | Phase 5 Text + 14 Icon + 38 Divider + 39 Spinner + `<I18nProvider>`; horizontal/vertical, linear mode, compound API   | [`41-stepper.md`](41-stepper.md)                 | Pending |
| 42  | **EmptyState**                             | 1      | Phase 4 Button + 14 Icon + 39 Spinner; 4 variants (default/error/loading/success); slot for DataGrid/FileUpload/Combobox | [`42-empty-state.md`](42-empty-state.md)         | Pending |
| 43  | **Rating**                                 | 2      | Phase 8 `useFormFieldA11y` + 14 Icon + `useControllableState`; W3C Slider keyboard, ½-step + exact precision, RTL pointer math | [`43-rating.md`](43-rating.md)                   | Pending |

**Batch 5 cross-cutting outcomes:**
- `<Spinner>` becomes the canonical loading-indicator primitive — Button / CircularProgress / Toast can migrate to it in follow-up PRs.
- `<Divider>` is consumed by Stack's auto-`divider` prop, Menu group separators, Card section breaks, and Stat group separators — eliminating inline `<hr className="border-t…" />` everywhere.
- `<EmptyState>` becomes the recommended slot content for DataGrid (`empty`), FileUpload (idle dropzone), Combobox (no-results), and search surfaces.
- `Stat.formatValue` is promotable to `@apx-dsine/intl` if DataGrid number-cell rendering converges on the same helper.
- After Batch 5, the DS has a full **layout vocabulary** (Stack/HStack/VStack/Spacer/Divider/EmptyState), a **status vocabulary** (Spinner/Stat/Stepper), and rounds out the form controls with Rating.

---

## Batch 6 — Composition + Hierarchy + Specialty (Phases 44–48)

Five more plans authored to round out the Leader's requested "next 10" — the components from that
list that weren't already covered by Phases 33 (Calendar), 35 (Kbd), 41 (Stepper), 42 (EmptyState),
or 43 (Rating). Batch 6 leans into composition + hierarchical + specialty form controls.

| #   | Component                              | Tier   | Dep highlights                                                                                                                            | Doc                                              | Status  |
| --- | -------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------- |
| 44  | **Toolbar + Group + Separator + Spacer** | 2    | Phase 6 Button + 17 Tooltip + 22 Menu + 30 ToggleGroup + 38 Divider; W3C Toolbar keyboard, ResizeObserver overflow → "more" Menu             | [`44-toolbar.md`](44-toolbar.md)                 | Pending |
| 45  | **Timeline** (vertical + horizontal + alternating) | 2   | Phase 5 Text + 14 Icon + 38 Divider + 41 Stepper pattern + `<I18nProvider>`; `Intl.RelativeTimeFormat` for "5 minutes ago"                | [`45-timeline.md`](45-timeline.md)               | Pending |
| 46  | **TreeView** (W3C TreeView pattern)    | 2.5    | Phase 9 Checkbox + 14 Icon + 39 Spinner + (opt) virtualization via `@tanstack/react-virtual` + `<I18nProvider>`; async loadChildren; native HTML5 DnD with keyboard-accessible drag mode | [`46-tree-view.md`](46-tree-view.md)             | Pending |
| 47  | **ColorPicker + ColorSwatch + ColorInput** | 2.5 | Phase 7 Input + 18 Popover + 22 Menu + 28 Slider + 8 useFormFieldA11y + `<I18nProvider>`; pure `_shared/color.ts` (~100 LoC; no `tinycolor2`); WCAG contrast chip; opt-in EyeDropper | [`47-color-picker.md`](47-color-picker.md)       | Pending |
| 48  | **TagsInput**                          | 2      | Phase 7 Input + 12 Badge + 8 useFormFieldA11y + 34 Combobox patterns + `<I18nProvider>`; per-tag `validate`; paste-multi-token; suggestion listbox (sync + async) | [`48-tags-input.md`](48-tags-input.md)           | Pending |

**Batch 6 cross-cutting outcomes:**
- Toolbar exercises roving-tabindex composition across child Toggles / Buttons / Menus — pattern that may eventually justify a shared `useRovingTabindex` engine hook (Tabs / Radio / Menu / Toolbar = 4 candidates).
- Timeline introduces `formatTimestamp` (pure, `Intl.RelativeTimeFormat`-based) — promotion candidate alongside Phase 40's `formatValue` if a third consumer needs it.
- TreeView is the first virtualization consumer outside of DataGrid + Combobox; confirms `@tanstack/react-virtual` as the standard DS virtualization library.
- ColorPicker's `_shared/color.ts` (~100 LoC, pure) replaces any need for `tinycolor2` / `chroma-js`; WCAG contrast helper is a promotion candidate for engine if Alert / Toast / Theme Studio reuse.
- TagsInput is the pattern parallel for Combobox — they share the suggestion-listbox + `useDeferredFilter` infrastructure but diverge on value model (free-form strings vs. constrained options).
- After Batch 6, the DS covers **composition primitives** (Toolbar), **hierarchical display** (TreeView + Timeline), and the last common specialty form controls (ColorPicker, TagsInput).

---

## Batch 7 — High-impact composition (Phases 49–55)

The layer above individual components. Once these ship, consumers can build the entire chrome of a
SaaS product — Field/Form wrap any control; AppShell/Sidebar/NavigationMenu compose the page; Table
covers the 80% data-display case before reaching for DataGrid; HoverCard rounds out the overlay
family.

| #   | Component                                | Tier   | Dep highlights                                                                                                                              | Doc                                              | Status  |
| --- | ---------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------- |
| 49  | **Field** (+ Label / Description / Helper / Error / Control) | 2 | All form controls (07–48); `useFormFieldA11y`; floating-label CSS pattern; `fieldset`/`legend` for grouped controls; zero-source-change integration with the 13 form controls via FieldContext | [`49-field.md`](49-field.md) | Pending |
| 50  | **Form + FormProvider + useForm()**        | 2.5    | Phase 49 Field; `useReducer`-based state engine; Formik-shaped surface but ~3 KB instead of ~13 KB; per-field + central validators; async with debounce; server-error path; Field auto-binding via FormContext + name | [`50-form.md`](50-form.md) | Pending |
| 51  | **AppShell** (+ `useAppShell`)             | 2      | Drawer (mobile sidebar), `useBreakpoint`; 4 named slots (header/sidebar/aside/footer + main); 2 layout variants (`default` / `inset`); rail-mode collapse + mobile drawer; skip-to-content; floating header variant | [`51-app-shell.md`](51-app-shell.md) | Pending |
| 52  | **NavigationMenu** (+ Trigger / Link / Content / Group / Featured / Indicator) | 2.5 | Popover + Menu + Slot + Divider; W3C Menubar keyboard; mega-menu variant with grid columns + featured slot; animated indicator that slides between items; hover-with-delay + click triggers | [`52-navigation-menu.md`](52-navigation-menu.md) | Pending |
| 53  | **Sidebar** (+ Header / Section / Item / SubItems / Spacer / Footer) | 2 | Accordion mechanics + Tooltip (rail labels) + Badge + Divider + Slot; rail-mode auto-Tooltip wrapping; collapsible Sections + expandable Items; `isActiveHref` exact/prefix matching | [`53-sidebar.md`](53-sidebar.md) | Pending |
| 54  | **HoverCard** (+ Trigger / Content / Arrow) | 2     | Popover positioning + escape stack + `useHoverDelay` (from Tooltip); "bridge" pattern for mouse trigger→content traversal; `trigger="hover-focus"` for keyboard a11y; no focus trap | [`54-hover-card.md`](54-hover-card.md) | Pending |
| 55  | **Table** (+ Head / Body / Row / Cell / HeaderCell / Foot / Caption) | 2 | Checkbox (selection) + Menu (row actions) + EmptyState + Skeleton (loading); compound + declarative APIs; single-column sort with string/number/date/custom sortFn; sticky header CSS-only; responsive hidden columns | [`55-table.md`](55-table.md) | Pending |

**Batch 7 cross-cutting outcomes:**
- **Field + Form together close the form-composition gap.** Today every consumer pairs a label with a control manually; after Phase 49+50 ships, `<Form>` + `<Field name>` + any DS control = one-liner per field. Both integrate with the existing 13 form controls **without any source-code changes** thanks to FieldContext + FormContext.
- **AppShell + Sidebar + NavigationMenu compose the entire product chrome.** Three primitives that together replace ~500 lines of hand-rolled layout in every consumer project.
- **`useBreakpoint` is finalized as engine-promotion-ready** — AppShell + NavigationMenu + Sidebar = 3 consumers (threshold met).
- **`useHoverDelay` is finalized as engine-promotion-ready** — Tooltip + NavigationMenu + HoverCard = 3 consumers (threshold met).
- **`isActiveHref` is a candidate shared helper** for NavigationMenu (Phase 52) + Sidebar (Phase 53) — promote to `_shared/` if both adopt.
- **Table sits intentionally below DataGrid (Phase 27).** ~4 KB Table vs ~9 KB DataGrid. Consumer picks the right primitive via a documented decision matrix.
- After Batch 7, the DS has **end-to-end product coverage**: tokens + theme + primitives + form controls + overlays + complex data surfaces + composition. Total **49 component plans**.

---

## Phase 56 — Carousel (Tier 2.5, ad-hoc addition)

Authored separately at Ahmad's explicit request ("I need carousel solution — focus on that it should be good one"). Sits alongside Batch 7; not part of any batch grouping.

| #   | Component                                                                             | Tier   | Dep highlights                                                                                                                              | Doc                                              | Status  |
| --- | ------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------- |
| 56  | **Carousel** (+ Viewport / Track / Slide / PrevButton / NextButton / Indicators / AutoplayControl / Controls / LiveRegion) | 2.5    | Button, Tooltip (thumbnail indicators), Icon, Slot; **no third-party carousel library**; CSS scroll-snap + IntersectionObserver + small reducer; autoplay OFF by default, visible pause/play required when on; clone-bracketing loop; W3C APG keyboard pattern; reduced-motion respects autoplay + scroll-behavior; smart-default rendering; full RTL via native scroll | [`56-carousel.md`](56-carousel.md) | Pending |

**Phase 56 cross-cutting outcomes:**
- **No new dependencies.** Specifically not pulling in `embla-carousel-react` (~12 KB), `swiper` (~50 KB), or `keen-slider` (~10 KB). CSS scroll-snap + ~80 LoC loop logic + IntersectionObserver gets the same UX at < 5 KB gz.
- **WCAG 2.2.2 first-class.** Autoplay defaults to off; when enabled, visible pause/play control is always rendered. Cannot be disabled.
- **Renderer ship-gate compliance built into the plan.** Every example (Basic / Autoplay / HeroBanner / ProductLane / Loop / Controlled / Programmatic / ImageGallery / TestimonialCarousel) has visible clickable controls that demonstrate behavior without surprise auto-motion.
- **Smart-default rendering**: simplest use (`<Carousel ariaLabel="…"><Carousel.Slide>…</…>`) auto-includes Viewport/Track/Prev/Next/Indicators. Power users use the explicit compound for fine control.
- **CSS scroll-snap = the engine.** Native swipe / momentum / RTL / keyboard scroll all delegated to the browser; JS only coordinates the index, autoplay, and navigation buttons.

---

## Phase 57 — Icon + IconProvider (Tier 1, cross-cutting)

Authored after multiple shipped phases (Phase 42 EmptyState explicitly) flagged the missing `<Icon>` primitive. Sits alongside Batch 7 + Carousel; not part of any batch grouping but is the single most-used component across every Tier-2 plan I've authored.

| #   | Component                                                              | Tier   | Dep highlights                                                                                                                              | Doc                                              | Status  |
| --- | ---------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------- |
| 57  | **Icon + IconProvider** (+ `createIconRegistry` + `useIconRegistry` + `DS_ICON_NAMES`) | 1 | Phase 3 `<Slot>`, Phase 5 Text (shipped); library-agnostic — works with lucide / heroicons / radix-icons / iconify / inline SVG; three render modes (`as` static / `name` registry / `children` inline) with documented precedence; decorative-by-default a11y; `rotate` / `flip` / `spin` utility props; documented `DS_ICON_NAMES` stable contract typed `as const`; strict-mode registry validation; **no breaking changes** to existing components | [`57-icon.md`](57-icon.md) | Pending |

**Phase 57 cross-cutting outcomes:**
- **Closes the gap multiple agents flagged.** Phase 42 EmptyState's Outcome explicitly said *"No `Icon` / `Text` / `Stack` components exist."* Text (Phase 5) shipped; Stack (Phase 37) shipped; Icon is the last leg.
- **Library-agnostic by design.** DS never ships an opinionated icon library; consumers wire their own (lucide / heroicons / radix-icons / iconify / hand-rolled SVGs) via `<IconProvider>` once at app root.
- **Decorative by default.** Most icons are paired with visible text and don't need announcement. Forcing `aria-hidden="true"` by default eliminates the #1 a11y bug in icon usage.
- **`DS_ICON_NAMES` typed `as const` is a stable contract.** Every shipped DS component internally references icons by name from this set. Consumers register their preferred SVG implementations once → every component lights up automatically.
- **No breaking changes.** All shipped components keep accepting `ReactNode` for icon slots. Migration to `<Icon name="..." />` is opt-in, one component at a time.
- After Phase 57, the DS finally has the trio Text + Stack + Icon — the three primitives every Tier-2 component plan assumes exist.

---

## Phase 58 — Scheduler (Tier 3, second deep component)

Authored as the second Tier-3 plan in the DS, sibling to Phase 27 DataGrid. Where DataGrid is the
canonical primitive for **tabular data**, Scheduler is the canonical primitive for **time-based
data** — and consumes nearly every overlay / form / data primitive shipped so far.

| #   | Component                              | Tier | Dep highlights                                                                                                                              | Doc                                              | Status  |
| --- | -------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ------- |
| 58  | **Scheduler** (+ `<Scheduler.Toolbar>` / `Sidebar` / `Viewport` / `MiniMonth` / `CalendarList` / `ResourceTree` / `HolidayToggle` / `QuickPopover` / `EventModal` / `MobileSheet` / `EventCard` / `NowIndicator` / `AllDayBand` / `ConflictOverlay` + `useScheduler()`) | 3 | Phase 33 Calendar + 18 Popover + 19 Modal + 20 Drawer + 22 Menu + 23 Select + 30 ToggleGroup + 17 Tooltip + 34 Combobox + 48 TagsInput + 55 Table + 46 TreeView + 49 Field + 9 Checkbox + 12 Badge + 14 Card + `<I18nProvider>` (from Phase 27). 8 views (Month / Week / WorkWeek / Day / MultiDay / Agenda / Year / Resource swimlanes). Hour-grid timeline + resource swimlane timeline both ship in one component. CRUD with `readOnly` / per-event `editable` predicate. Google-Calendar-style quick-create popover. Holidays (list / provider / built-in ~20-locale defaults). Filters (calendars / resources / search / dateRange / holidays / custom). Locale + RTL first-class; Hijri formatting via `Intl`. **No external date / scheduling library** — pure `Intl` + ~150 LoC `recurrence.ts` + reuses Phase 33's `dateMath.ts`. ~11k LoC, suggested 9 PRs. | [`58-scheduler.md`](58-scheduler.md) | Pending |

**Phase 58 cross-cutting outcomes:**
- **DS now ships two Tier-3 components.** DataGrid covers tabular data; Scheduler covers time-based data. Composition discipline proven scalable beyond a single deep component.
- **Calendar primitive (Phase 33) validated under a Tier-3 consumer.** Scheduler reuses `dateMath` + `computeMonthGrid` + `useCalendar` without modification. If anything has to be added during implementation, that's a signal Phase 33 was under-specified.
- **`<I18nProvider>` reaches consumer #6** (DataGrid, Pagination, Breadcrumbs, Calendar, Combobox, Scheduler) — locked-in as a load-bearing engine primitive.
- **Roving tabindex qualifies for engine promotion.** Scheduler is the 4th consumer (after Tabs, Menu, DataGrid) — meets the threshold per `pending/core/01-use-roving-tabindex.md`. Implementation should land alongside the engine promotion, not before.
- **Two `<TreeView>` consumers exist** (TreeView's own examples + Scheduler's resource grouping) — confirms TreeView's API.
- **Table (Phase 55) gets its second consumer** as the Agenda view's renderer — confirms Table sits naturally below DataGrid for "lightweight tabular display".
- **No new low-level primitives invented.** Every overlay / form / data surface composes a shipped component. The DS finally proves the "compose, don't reinvent" promise at full Tier-3 scale.
- **No external date / scheduling library.** Zero `date-fns` / `dayjs` / `luxon` / `rrule.js` / FullCalendar / react-big-calendar / Schedule-X / DHTMLX in the dependency graph. ~50 KB saved.

---

### Positioning engine prerequisite

Before Phase 17 (Tooltip), a small sub-phase must ship:

- **`@apx-dsine/positioning`** — wraps `@floating-ui/react` (or hand-rolls equivalent), exposes a `usePosition({ trigger, placement, offset, … })` hook returning `{ floatingRef, x, y, placement, middlewareData }`.
- **`@apx-dsine/portal`** — `<Portal container?={Element}>` primitive (SSR-safe; defers mount to `useEffect`).
- **`@apx-dsine/focus-trap`** — `useFocusTrap(open)` hook + sentinel-node strategy; used by Modal/Drawer.
- **`@apx-dsine/escape-stack`** — central `Esc`-key + outside-click stack so nested overlays close in the right order.

These four primitives are shared by **every** overlay in Batch 2. They live in `@apx-dsine`,
not in `_shared/components/` — Tooltip is their first consumer and validates the API. Subsequent
plans reuse them by reference.

A separate `plans/pending/core/17-positioning-engine.md` should be authored before Phase 17 starts;
the engine work is not a component plan and intentionally not counted in the 10 above.

### Why these ten, in this order

| Group         | Components                                   | What it proves                                                                                  |
| ------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Overlays      | Tooltip, Popover, Modal, Drawer, Toast, Menu | The positioning engine + `<Portal>` + focus-trap + escape-stack hold up under five different overlay shapes. |
| Form (overlay)| Select                                       | A form-control overlay (combobox) reuses the positioning engine *and* `useFormFieldA11y` from Batch 1. |
| Feedback (no overlay) | Progress, Skeleton                    | Pure-CSS animated indicators; let an idle agent ship in parallel with the positioning work.    |
| Disclosure    | Accordion                                    | First multi-section state primitive with controlled+uncontrolled item state.                   |

---

## When Every Plan in This Repo Is Complete

1. Move each `.md` from `pending/components/` to `completed/components/` with an appended
   `## Outcome` (final API, bundle delta, axe results, deviations).
2. Update `plans/README.md`'s status table with all rows flipped to ✓ Completed.
3. Both batches complete = the DS has a publishable feature-set roughly comparable to the first
   public release of MUI Joy / Radix Themes / Mantine. Cut `0.1.0` via Changesets.

---

## File Skeleton Each Plan Follows

Each of the ten files below is structured identically so reviewers can find the same information
in the same place across components:

```
# Phase N — <Component>

> Status / Depends on / Blocks

## Objective
## What this component proves
## Public API                                   ← TSX prop table
## Variants — designed inline                   ← the differentiator from Button-variants split
  - Variant list with appearance + recipe rows
  - Variant × color matrix
  - Sizes
  - Compound rules
## File structure
## Recipe sketch                                ← Component.recipe.ts
## Component sketch                             ← Component.tsx
## Types
## Accessibility
## Animation / interactions
## Responsive
## RTL
## Override examples
## Examples list (matches examples/*.tsx)
## Testing plan
## File-level tasks (ordered)
## Acceptance criteria
## DRY self-check
## Out of scope
## When complete
```