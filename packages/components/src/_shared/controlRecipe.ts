/**
 * Shared base class string for **form-control surfaces** — anything that paints a bordered,
 * focus-ringed container around an editable native element (`<input>`, `<textarea>`, future
 * `<Select>` shell, …). Extracted in Phase 7 (Input) so Phase 8 (Textarea) can drop in without
 * re-implementing the focus / invalid / disabled story.
 *
 * **Layout-free by design.** Consumers (Input, Textarea, future `<Select>` shell) pick their own
 * layout primitive in their own recipe's `base`:
 *
 *  - Input → `'relative isolate flex items-stretch overflow-hidden'` (horizontal row of
 *    addon + icon + input + icon + addon, clipped to the rounded shell).
 *  - Textarea → `'block w-full'` (single growing textarea, top-aligned).
 *  - Select shell → `'relative isolate flex items-stretch'` (similar to Input minus addons).
 *
 * Concerns owned here (truly shared across every form-control surface):
 *
 *  - `group/control` for slot-style descendant variants.
 *  - Typography defaults — semantic foreground + muted-placeholder tokens.
 *  - Single transition definition for the four properties that change between states.
 *  - Focus ring lives on the **wrapper** (`focus-within:ring-2`) so any leading/trailing slot is
 *    part of the same visual frame.
 *  - `aria-[invalid=true]` drives the danger border + ring color — set by either a sibling prop
 *    (`invalid`) or a future `<Field invalid>` ancestor. Keeping it attribute-driven means the
 *    parent doesn't need to thread a prop down.
 *  - `data-[disabled=true]` dims the wrapper and blocks pointer events for the whole frame.
 *    The native `disabled` attribute on the inner control does the rest.
 *
 * Concerns deliberately NOT here (live in each consumer's own recipe):
 *
 *  - Layout primitive (`flex` vs `block`) — see above.
 *  - `overflow-hidden` — only relevant for surfaces that clip child slots (Input addons). Textarea
 *    has nothing to clip and wants to keep `overflow-hidden` off so the resize handle is reachable.
 *  - `aria-busy:cursor-progress` — only Input ships a `loading` prop today. Textarea doesn't.
 */
export const controlBase = [
  'group/control',
  'font-normal text-fg placeholder:text-fg-muted',
  'transition-[border-color,background-color,box-shadow,color]',
  'duration-fast ease-standard',
  'outline-none',
  'focus-within:ring-2 focus-within:ring-offset-0',
  'aria-[invalid=true]:border-danger aria-[invalid=true]:focus-within:ring-danger',
  'data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none',
].join(' ');