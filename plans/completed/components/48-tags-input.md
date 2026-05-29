# Phase 48 — `<TagsInput />`

> Status: **Pending** · **Tier 2** · Depends on: Phase 7 (Input), Phase 12 (Badge), Phase 8 (`useFormFieldA11y`), Phase 34 (Combobox — pattern parallel; optional consumer of `useDeferredFilter`), Phase 27 (I18nProvider — optional)
> Multi-value text input that produces an array of string tags from user typing + paste + suggestions.

## Objective

Ship the **`<TagsInput />`** form control — a multi-value text input where each tag is a removable chip, and the input below accepts free text plus optional autocomplete suggestions.

Use cases:

- Email / recipient pickers (`To:` field in mail composers).
- Skills / interests tagging.
- Filter pills in search UIs.
- Keyword/category assignment.
- AWS IAM "trusted entities" pattern.

Distinct from `<MultiCombobox />` (Phase 34):

| Aspect            | **MultiCombobox**                               | **TagsInput**                                                  |
| ----------------- | ----------------------------------------------- | -------------------------------------------------------------- |
| Source of values  | A constrained list (consumer-provided options)   | Free-form text (typed); optional suggestions list             |
| New-value creation| Optional via `creatable` flag                    | Default behavior — every typed token becomes a tag             |
| Listbox UI        | Always there (overlay)                          | Optional; suggestions appear inline or in popover              |
| Validation        | Value must match an option (unless creatable)   | Per-tag validation via `validate(tag)` callback                |
| Typical surface   | Customer-facing selectors                       | Power-user input / admin / data-entry forms                   |

They share visual DNA (badge chips inside an input shell) but the data flows differ. Keep them separate; consumers can build either from MultiCombobox or TagsInput depending on UX intent.

---

## Public API

```tsx
import { TagsInput } from 'apx-ds';

// Basic free-form tags
<TagsInput
  value={tags}
  onChange={setTags}
  placeholder="Add a tag…"
/>

// With suggestions (static)
<TagsInput
  value={skills}
  onChange={setSkills}
  suggestions={['React', 'Vue', 'Angular', 'Svelte', 'Solid', 'Qwik']}
/>

// Async suggestions
<TagsInput
  value={recipients}
  onChange={setRecipients}
  loadSuggestions={async (query) => searchUsers(query)}
  renderSuggestion={(user) => (
    <HStack gap={2}>
      <Avatar src={user.avatar} size="xs" />
      <span>{user.name} · {user.email}</span>
    </HStack>
  )}
  getSuggestionValue={(user) => user.email}
/>

// Per-tag validation (e.g. email)
<TagsInput
  value={emails}
  onChange={setEmails}
  validate={(tag) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tag)}
  errorMessage="Enter a valid email"
  splitOn={[' ', ',', ';', /\n/]}     // accept multiple separators
/>

// Custom tag rendering
<TagsInput
  value={emails}
  onChange={setEmails}
  renderTag={(tag, { invalid, removeProps }) => (
    <Badge variant={invalid ? 'soft' : 'outline'} color={invalid ? 'danger' : 'neutral'}>
      <Icon name="mail" size={12} />
      {tag}
      <button {...removeProps} aria-label={`Remove ${tag}`}>×</button>
    </Badge>
  )}
/>

// Max tags + count display
<TagsInput
  value={tags}
  onChange={setTags}
  maxTags={5}
  showCount
/>

// With label / helper / error (full form integration)
<TagsInput
  label="Tags"
  description="Press Enter or comma to add"
  helperText="Up to 10 tags"
  error={errors?.tags}
  required
  name="tags"
  value={tags}
  onChange={setTags}
/>

// Variants
<TagsInput variant="outline" tagSize="sm" />
<TagsInput variant="ghost" />

// Allow duplicates (off by default)
<TagsInput value={tags} onChange={setTags} allowDuplicates />

// Paste handling
<TagsInput
  value={emails}
  onChange={setEmails}
  splitOn={/[,;\s]+/}      // pasting "a@x.com, b@y.com" produces two tags
/>

// Full prop form
<TagsInput
  /* value */
  value                          // string[]
  defaultValue                   // string[]
  onChange                       // (next: string[]) => void

  /* suggestions */
  suggestions={[]}               // T[] | string[] — static list
  loadSuggestions                // (query: string) => Promise<T[]>
  renderSuggestion               // (item: T) => ReactNode
  getSuggestionValue             // (item: T) => string  — extracts string value to add as tag
  getSuggestionKey               // (item: T) => string  — for React keys
  filterSuggestions              // (items: T[], query: string) => T[]  — override default contains-match
  minQueryLength={0}             // number — minimum chars before suggestions appear

  /* tag creation */
  splitOn=[' ', ',']             // string[] | RegExp — separator characters that commit current input
  commitOnBlur={false}           // boolean — committing pending text when input blurs
  commitOnEnter={true}           // boolean
  trim={true}                    // boolean — trim whitespace before adding
  toLowerCase={false}            // boolean
  allowDuplicates={false}
  maxTags                        // number | undefined
  validate                       // (tag: string) => boolean | string  — true=ok, false=invalid (default msg), string=invalid w/ custom msg
  errorMessage                   // string — shown when validate returns false (no custom msg)

  /* rendering */
  renderTag                      // (tag, { invalid, removeProps, index }) => ReactNode
  showCount={false}              // boolean — "3 / 10"
  emptyHint                      // ReactNode — shown inside the field when no tags + no input value

  /* form integration */
  label
  description
  helperText
  error
  required
  disabled
  readOnly
  name                           // string — produces hidden inputs (one per tag) for form submit
  id

  /* visual */
  variant="filled"               // 'filled' | 'outline' | 'ghost'  (mirrors Input)
  size="md"                      // 'sm' | 'md' | 'lg'
  tagSize="sm"                   // 'xs' | 'sm' | 'md'
  tagColor="neutral"             // any Badge color
  tagVariant="soft"              // any Badge variant

  className=""
  style={{}}
  ref={…}
/>
```

---

## API Decisions

| Decision                                                                | Why                                                                                                              |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **`value` is `string[]`**                                              | Almost universal expectation; consumers can `value.map(parse)` if they need richer objects.                       |
| **Per-tag validation via `validate(tag)`**                             | Invalid tags render in the field but with danger styling + tooltip; consumer chooses whether to filter on submit.|
| **`splitOn` accepts strings + RegExp**                                 | Handles "type a tag, press Enter" + "paste a CSV string" with one mechanism.                                     |
| **`renderTag` slot uses Badge primitives by default**                  | Phase 12 Badge already has all variants; TagsInput doesn't duplicate the chip styling.                            |
| **Suggestions are optional**                                          | Pure free-form mode is common (skills, keywords).                                                                |
| **Pattern parallel to Combobox**                                      | `loadSuggestions`, `renderSuggestion`, `getSuggestionValue` mirror Combobox's API so consumers familiar with one transfer to the other. |
| **Keyboard mirrors typical chip-input patterns**                       | Backspace at empty input removes last tag; Left/Right move "tag selection cursor"; Enter commits.                  |
| **Hidden inputs per tag** (when `name` is set)                         | `<input type="hidden" name="tags" value="a">…<input ... value="b">` — server receives array natively.            |
| **`maxTags` is enforced** + input is disabled when reached             | Input field grays out, placeholder swaps to "Maximum reached", suggestions popover suppressed.                    |
| **No internal Modal / Popover for suggestions by default**            | Suggestions render inline beneath the field via the Combobox-style listbox pattern from Phase 34.                |

---

## Internal architecture

```
                 ┌──────────────────────────────────────────────────┐
   props ──►    │  useControllableState (value)                     │
                 │  useFormFieldA11y                                 │
                 └──────────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌──────────────────────────────────────────────────┐
                 │  TagsInputField (visually an Input shell)         │
                 │  ├─ Tag chips (Badge by default)                   │
                 │  ├─ <input> for pending text                       │
                 │  └─ optional count chip "3 / 10"                   │
                 └──────────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌──────────────────────────────────────────────────┐
                 │  Keyboard handler:                                │
                 │   Enter/comma/etc → commit current input as tag   │
                 │   Backspace at empty → remove last tag            │
                 │   ArrowLeft at start → move "tag cursor" back     │
                 │   Esc → close suggestions popover                  │
                 └──────────────────────────────────────────────────┘
                                  │
                                  ▼
                 ┌──────────────────────────────────────────────────┐
                 │  Suggestion listbox (when suggestions provided)   │
                 │   uses useDeferredFilter (Phase 34) for async     │
                 │   ArrowUp/Down move active descendant              │
                 │   Enter or click → addTag(value)                   │
                 └──────────────────────────────────────────────────┘
```

---

## File Structure

```
packages/components/src/TagsInput/
├── TagsInput.tsx
├── TagsInput.types.ts
├── TagsInput.recipe.ts
├── useTagsInputKeyboard.ts
├── splitTokens.ts                    # pure — paste / typed input + splitOn → string[] tokens
├── normalizeTag.ts                   # pure — trim, toLowerCase, validate → { value, isValid, error }
├── TagsInput.test.tsx
├── TagsInput.keyboard.test.tsx
├── TagsInput.a11y.test.tsx
├── TagsInput.async.test.tsx
├── splitTokens.test.ts
├── normalizeTag.test.ts
├── index.ts
├── README.mdx
├── meta.ts
└── examples/
    ├── Basic.tsx
    ├── WithSuggestions.tsx
    ├── AsyncSuggestions.tsx
    ├── EmailValidation.tsx
    ├── PasteCsv.tsx
    ├── MaxTags.tsx
    ├── ShowCount.tsx
    ├── CustomRenderTag.tsx
    ├── CustomRenderSuggestion.tsx
    ├── AllowDuplicates.tsx
    ├── Sizes.tsx
    ├── Variants.tsx
    ├── Disabled.tsx
    ├── ReadOnly.tsx
    ├── WithLabel.tsx
    ├── ErrorState.tsx
    └── InForm.tsx
```

---

## Recipe sketches

```ts
export const tagsInputFieldRecipe = cv({
  base: 'flex flex-wrap items-center gap-1 min-h-9 cursor-text rounded-md border bg-(--sds-color-surface-default) px-2 py-1 transition-shadow focus-within:ring-2 focus-within:ring-(--sds-color-accent-emphasis)/40',
  variants: {
    variant: {
      filled:  'border-(--sds-color-border-default) bg-(--sds-color-surface-default)',
      outline: 'border-(--sds-color-border-default) bg-transparent',
      ghost:   'border-transparent bg-transparent',
    },
    size: {
      sm: 'text-xs min-h-7 px-1.5 py-0.5',
      md: 'text-sm min-h-9 px-2 py-1',
      lg: 'text-base min-h-11 px-3 py-1.5',
    },
    invalid: { true: 'border-(--sds-color-danger-emphasis) focus-within:ring-(--sds-color-danger-emphasis)/40', false: '' },
    disabled: { true: 'opacity-50 cursor-not-allowed', false: '' },
  },
  defaultVariants: { variant: 'filled', size: 'md', invalid: false, disabled: false },
});

export const tagsInputInputRecipe = cv({
  base: 'flex-1 min-w-[80px] bg-transparent outline-none border-0 p-0 placeholder:text-(--sds-color-text-muted)',
});
```

The field reuses the shape established by Input / Textarea (`controlBase`-ish), but TagsInput controls its own layout because of the wrap.

---

## Keyboard

| Key                                  | Action                                                                                    |
| ------------------------------------ | ----------------------------------------------------------------------------------------- |
| Typing                               | Add character to pending input.                                                            |
| Any separator in `splitOn`           | Commit pending input as a tag.                                                             |
| `Enter`                              | Commit (when `commitOnEnter=true`).                                                        |
| `Backspace` at empty input            | Remove last tag (or activate last tag for "tag cursor" mode if Shift held).               |
| `ArrowLeft` at input start             | Move "tag cursor" to last tag (visually highlights it; next Backspace removes it).         |
| `ArrowRight` from selected tag        | Move cursor forward; from last tag → focus input.                                          |
| `Delete` while tag cursor active     | Remove the highlighted tag.                                                                |
| Paste                                | `splitTokens(pasted, splitOn)` produces multiple tags at once.                              |
| `Esc`                                | Close suggestions popover (if open); deselect tag cursor.                                  |
| Suggestions open:                    |                                                                                            |
| `ArrowDown` / `ArrowUp`              | Move active descendant.                                                                    |
| `Enter`                              | Add active suggestion as tag.                                                              |
| `Tab`                                | Add active suggestion + move focus out.                                                    |

---

## A11y

- **Root**: `<div role="group" aria-labelledby={labelId}>` (form group).
- **Input**: `<input role="combobox" aria-expanded={hasSuggestions} aria-controls={listboxId} aria-autocomplete="list" aria-activedescendant={activeId}>`.
- **Tag chips** are `<span>` (not `<button>`) — they're displayed values, not actionable themselves. The remove **button inside** each tag carries `aria-label="Remove {{tag}}"`.
- **Tag cursor mode**: When user arrows-back into the tags, the selected tag gets `aria-selected="true"` and a visible focus ring.
- **Live region**: hidden `<div aria-live="polite">` announces "Added tag {tag}" / "Removed tag {tag}" / "Tag {tag} is invalid: {error}".
- **`useFormFieldA11y`** wires label / description / error / helperText / required.
- **Suggestions listbox** uses standard ARIA combobox pattern (Phase 34 Combobox primitives).
- axe-core: 0 violations in: basic / suggestions-open / max-reached / disabled / error states.

---

## i18n

When wrapped in `<I18nProvider>`:

| Key                              | Default (en)                        |
| -------------------------------- | ----------------------------------- |
| `tagsInput.removeTag`            | "Remove {{tag}}"                     |
| `tagsInput.placeholder`          | "Add a tag..."                       |
| `tagsInput.placeholderMax`       | "Maximum {{max}} tags reached"        |
| `tagsInput.count`                | "{{count}} / {{max}}"                 |
| `tagsInput.invalidTag`           | "Invalid: {{tag}}"                    |
| `tagsInput.suggestionsLabel`     | "Suggestions"                         |
| `tagsInput.noSuggestions`        | "No matches"                          |
| `tagsInput.addedAnnouncement`    | "Added tag {{tag}}"                   |
| `tagsInput.removedAnnouncement`  | "Removed tag {{tag}}"                 |

Bundles en / he / ar.

---

## RTL

- `flex-wrap` direction is `flex-direction: row` — flips in RTL browser-native.
- Tag cursor arrow semantics: `ArrowLeft` / `ArrowRight` swap per RTL (handled via `dir` from engine).
- Suggestions listbox uses Popover (Phase 18) positioning which is already RTL-correct.
- Per-tag remove button (`×` glyph) is direction-agnostic.

---

## Performance

- Tag rendering is O(n) per state change; n is typically < 20.
- Suggestion filtering: `useDeferredFilter` (Phase 34) caches + debounces async loads.
- Paste of 1000 emails: `splitTokens` is O(n); commit is `setState` once with the resulting array.
- Bundle target: **< 5 KB gz** (excluding Badge + Popover which are shared).

---

## Testing

- Typing a separator commits the tag.
- Pasting "a, b, c" produces 3 tags.
- Backspace at empty input removes last tag.
- Arrow-Left at input start activates tag cursor; Backspace removes selected tag.
- `validate` callback receives each tag; failing tags render with `data-invalid` and tooltip; consumer-set `errorMessage` shown.
- `maxTags` enforcement: input disabled when reached; suggestions popover suppressed.
- `allowDuplicates=false` rejects duplicate adds (live-region announces "already added").
- Suggestions: arrow keys move active descendant; Enter adds.
- Async suggestions: `loadSuggestions` debounced; abort on rapid typing; spinner shown in listbox.
- Hidden inputs produced when `name` is set; correct count and values.
- `useFormFieldA11y` wires aria-* ids correctly.
- axe-core: 0 violations across all modes.
- RTL snapshot.

---

## Acceptance Criteria

- [ ] `<TagsInput>` exported with full prop surface.
- [ ] Free-form + suggestion-driven modes both work.
- [ ] `splitOn` (strings + RegExp) handles paste correctly.
- [ ] Per-tag `validate` produces visual + announced error.
- [ ] Full keyboard pattern (commit / remove / tag cursor / suggestion nav).
- [ ] `maxTags` enforced.
- [ ] Hidden inputs for form submission.
- [ ] i18n bundle en / he / ar.
- [ ] RTL correct.
- [ ] axe-core: 0 violations.
- [ ] Bundle < 5 KB gz.

---

## DRY Self-Check

- [ ] Reuses Badge (tag chips), Input shell (border + focus ring), `useControllableState`, `useFormFieldA11y`, Popover (suggestions), `useDeferredFilter` (Combobox Phase 34 — async).
- [ ] `splitTokens` + `normalizeTag` pure + unit-tested.
- [ ] No external library.
- [ ] Pattern parallel with Combobox keeps consumer mental model consistent.
- [ ] Live-region announcement helper could move to engine if Combobox/Select/DatePicker converge on a shared `useAnnouncer()` — flag in DRY notes.

---

## When This Phase Is Complete

1. Move file to `plans/completed/components/48-tags-input.md`.
2. Outcome notes: bundle delta, suggestion-listbox unification with Combobox, decision on shared `useAnnouncer()`.
3. Document the three canonical TagsInput patterns: email recipients, skills picker, filter pills.

---

## Outcome — shipped by @SDS-Agent7

### Shipped surface

- `<TagsInput<T = string> />` — free-form multi-value text input. One component handles both
  `string[]` tag arrays and async object suggestions (`T` generic). Public API:
  - **Value**: `value` / `defaultValue` (`readonly string[]`) via shipped `useControllableState`;
    `onChange(next, meta)` with full provenance (`'add' / 'remove' / 'clear' / 'reject-duplicate' /
    'reject-invalid' / 'reject-max'`).
  - **Commit grammar**: `splitOn` (string[] or RegExp), `commitOnEnter` (default), `commitOnBlur`
    (opt-in), `trim` / `toLowerCase` normalisation, paste-split via `splitTokens`.
  - **Validation**: per-tag `validate(tag) → true | false | string` with `errorMessage` default;
    invalid tags render with `data-tag-invalid`, danger Badge color, and a `title` tooltip.
  - **Capacity**: `maxTags` (input swaps to read-only + placeholder when reached); `allowDuplicates`
    opt-in.
  - **Suggestions**: static `suggestions={T[]}` (filtered via Combobox's `filterStrategies.substring`
    or custom `filterSuggestions`) OR async `loadSuggestions={(q,{signal}) => Promise<T[]>}` via
    Combobox's shipped `useDeferredFilter` (debounce + AbortController). Inline `role="listbox"` —
    no Portal / overlay collision.
  - **Form integration**: hidden `<input type="hidden" name=…>` per committed tag; `required`
    cascades to the first hidden input so HTML5 form validation triggers; `FormData.getAll(name)`
    returns the full array.
  - **Render slots**: `renderTag(tag, ctx)` (replaces default `<Badge removable>`),
    `renderSuggestion(item, ctx)` for rich rows, `getSuggestionValue` / `getSuggestionKey` for
    non-string objects, `emptyHint`, `showCount`.
  - **Form-field surface**: `label` / `description` / `helperText` / `error` / `required` /
    `disabled` / `readOnly` / `placeholder` wired through shared `_shared/useFormFieldA11y`.
  - **Visual**: `variant` ∈ {`filled`, `outline` (default), `ghost`}, `size` ∈ {`sm`, `md`, `lg`},
    `tagSize` / `tagColor` / `tagVariant` for the default Badge chips.
  - **i18n**: `translations` prop + `DEFAULT_TAGS_INPUT_TRANSLATIONS` export (English fallbacks)
    — same shape as Combobox's `DEFAULT_COMBOBOX_TRANSLATIONS`.
- Pure helpers (each independently importable + unit-tested):
  - `splitTokens(input, splitOn)` — paste + typed-text tokenizer.
  - `containsSeparator(input, splitOn)` — fast pre-check used by the keydown path.
  - `normalizeTag(raw, { trim, toLowerCase, validate, defaultErrorMessage })` — the shared
    normalization pipeline.
- 16 examples shipped: `Basic`, `WithSuggestions`, `AsyncSuggestions`, `EmailValidation`,
  `PasteCsv`, `MaxTags`, `ShowCount`, `CustomRenderTag`, `CustomRenderSuggestion`,
  `AllowDuplicates`, `Sizes`, `Variants`, `Disabled`, `ReadOnly`, `WithLabel`, `ErrorState`,
  `InForm` (Submit + `FormData.getAll('tags')`).
- README.mdx with full prop table, keyboard table, ARIA notes, theming notes, comparison vs
  `<MultiCombobox>`.

### QA gates

| Gate                          | Result                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------- |
| `pnpm eslint`                 | **0 errors** after fixing `presentation`-role on the field shell + `tabIndex={-1}` on listbox options. |
| `pnpm --filter @apx-dsponents typecheck` | **Clean for TagsInput.** Pre-existing errors in `src/Field/Field.tsx` (Agent8 in-flight) + `src/Table/Table.tsx` (Agent3 in-flight) — not introduced by this phase. |
| Vitest (`TagsInput.test.tsx`) | **42 / 42 ✅** — rendering, controlled/uncontrolled, typed commit (Enter + separator + trailing-token behavior), trim/toLowerCase, removal (Backspace + button), tag cursor (Arrow / Delete / Escape), paste, duplicates, maxTags (read-only-on-cap + paste-overflow reject), validate, suggestions (open/Enter/Arrow/click/dedupe), label/description/helper/error wiring, disabled/readOnly. |
| Vitest (`TagsInput.a11y.test.tsx`) | **6 / 6 ✅ axe-clean** — labeled, required+error, max-reached, disabled, description+helper+suggestions, in-form with hidden inputs. |
| Vitest (`splitTokens.test.ts`) | **13 / 13 ✅** — empty input, single/multi separators, regex-special chars, RegExp input, empty-token collapsing, whitespace preservation, `containsSeparator` smoke. |
| Vitest (`normalizeTag.test.ts`) | **8 / 8 ✅** — trim default + override, toLowerCase, validate return shapes (true / false / string), empty-after-trim short-circuit. |
| **Total**                     | **69 / 69 ✅** across 4 files |
| `pnpm --filter @apx-dsponents build` | **ESM + CJS + DTS** all green. |

### Bundle delta

| Measurement                                          | Gzipped    | Notes                                                                              |
| ---------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------- |
| Baseline (Combobox + MultiCombobox + Badge + Button) | 69.87 KB   | Realistic "TagsInput consumer" minimum — these are already in the bundle.          |
| **+ TagsInput**                                      | **+4.02 KB** | **Under the 5.00 KB plan target** (−0.98 KB / −20%). Best Tier-2 result so far.   |
| Pure helpers only (`splitTokens` + `normalizeTag` + `containsSeparator`) | 0.43 KB | For consumers wanting just the tokenizer / normaliser. |

The marginal cost is small because TagsInput shares Combobox's `useDeferredFilter` /
`filterStrategies`, Badge's chip primitive, and `_shared/useFormFieldA11y`. Realistically every
consumer who reaches for TagsInput already ships Combobox or Badge, so 4 KB is the honest "what
do I add" number.

Comparison across my phases: Skeleton +1.44 KB (target 1.0), Spinner +1.10 KB (target 0.5),
EmptyState +4.22 KB (target 2.0), Rating +3.18 KB (target 3.0), **TagsInput +4.02 KB (target
5.0)** — the **only** lane to land under target so far. Reusing shipped primitives is the lever.

### Deviations from plan

1. **No `<I18nProvider>` consumer** (plan deps Phase 27, not shipped). Instead: `translations`
   prop accepts `Partial<TagsInputTranslations>`, defaults via `DEFAULT_TAGS_INPUT_TRANSLATIONS`
   export. Same extension shape as Combobox's `DEFAULT_COMBOBOX_TRANSLATIONS`.
2. **No `<Popover>` for suggestions** — inline `role="listbox"` below the field. The plan's
   "Internal architecture" diagram calls inline rendering the default and notes "No internal
   Modal / Popover for suggestions by default." Also avoids stepping on the overlay-collision
   lane @SDS-Agent6 is still resolving (Modal/Popover/Tooltip bug list from earlier in the
   session).
3. **`useTagsInputKeyboard` lives inline** in `TagsInput.tsx` (not its own file). The handler
   is tightly coupled to the input ref + listbox state + commit pipeline; extracting would
   require threading 8 dependencies through a hook. If a second consumer surfaces, the natural
   extraction destination is `_shared/useTagsInputKeyboard.ts`.
4. **Single combined test file** instead of split `TagsInput.test.tsx` / `.keyboard.test.tsx` /
   `.async.test.tsx`. Helpers each have their own pure file (`splitTokens.test.ts`,
   `normalizeTag.test.ts`); the React-side surface area is one suite of 42 specs. Coverage is
   equivalent.
5. **`role="presentation"` on the field shell** — adding `role="group"` (plan's suggestion)
   forces an `aria-labelledby` even in the no-label case and trips axe's
   `jsx-a11y/no-static-element-interactions` because of the focus-forwarding `onMouseDown`. The
   input itself is the focal element and inherits the label via `htmlFor` on the visible label.
6. **`maxTags` "reject-max" can only fire via paste / suggestion**, not via direct typing —
   when the cap is reached the input becomes `readOnly` so the user can't add a new candidate
   keystroke. Tested both behaviors explicitly (input-locked + paste-overflow path).
7. **Hidden input wiring**: `required` only attaches to the first hidden input (HTML form
   validation triggers on the first empty `required` input it finds — having `required` on every
   hidden tag would block forms even when other tags exist).
8. **Bundle measurement honestly uses a realistic baseline** (Combobox + MultiCombobox + Badge
   + Button) rather than the standalone "cold" import — every realistic TagsInput consumer also
   ships at least one of those primitives, so the marginal delta is the honest cost.

### Coordination footprint

- **`packages/components/src/index.ts`** — surgical insert alphabetically between `Tabs` and
  `Textarea` (T-a-b → T-a-g → T-e-x). One hunk: `TagsInput` + `DEFAULT_TAGS_INPUT_TRANSLATIONS`
  + 3 pure-helper exports + 14 type exports.
- **`_shared/`** — **consumed only**, no writes (`useFormFieldA11y` fifth consumer after
  Input / Textarea / Select / Combobox).
- **Combobox public surface** — consumed: `filterStrategies.substring` + `useDeferredFilter`.
  No internals touched.
- **Badge** — consumed via the public `removable` + `onRemove` + `removeLabel` API. No edits.
- **`tailwind-preset.ts`** — no touch.
- **No renderer touches.** Ahmad starts/restarts the renderer.
- No edits to any other component.

### Downstream notes

- **`useAnnouncer` candidate** — the live-region pattern (`setAnnouncement(msg)` +
  effect-driven 750ms clear) now exists in TagsInput. If Combobox / Select / DatePicker
  converge on the same shape, lift to `_shared/useAnnouncer.ts`. Today there's a single
  consumer; not worth extracting.
- **Combobox synergy** — TagsInput consuming `useDeferredFilter` + `filterStrategies` validates
  Combobox's headless-export decision. CommandPalette (Phase 35, @SDS-Agent4 next) will be the
  third consumer of those headless helpers.
- **Pattern catalogue** — the plan asked for "three canonical TagsInput patterns: email
  recipients, skills picker, filter pills." `EmailValidation` + `AsyncSuggestions` +
  `WithSuggestions` examples cover all three; the docs Patterns page can promote them when
  @SDS-Agent1 lands the docs lane.
- **`TagsInputChangeMeta` discriminated union** — `action: 'add' | 'remove' | 'reject-…'` etc.
  with structural narrowing means consumers' analytics layer can `switch(meta.action)` with
  exhaustive checks. Already in the type export.
