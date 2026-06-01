# @apx-ui/icons

A small, tree-shakable set of SVG icon components for apx-ds.

> This package is **optional**. Nothing inside `@apx-ui/ds` depends on it — install it only when you actually want icons in your app, and you'll only pay the bundle cost for the icons you import.

## Install

```bash
pnpm add @apx-ui/icons
# or
npm i @apx-ui/icons
# or
yarn add @apx-ui/icons
```

Peers: `react >= 18`, `react-dom >= 18`.

## Usage

```tsx
import { ChevronDown, Search } from '@apx-ui/icons';

export function Example() {
  return (
    <>
      <Search size={18} aria-hidden />
      <ChevronDown size={16} title="Open menu" />
    </>
  );
}
```

Every icon is a `forwardRef`'d `<svg>` painted with `currentColor`, so it inherits the parent's `color`. Pass any native `<svg>` prop — `className`, `style`, `onClick`, `data-*`, etc.

### Props

| Prop    | Type                  | Default | Notes                                                                                              |
| ------- | --------------------- | ------- | -------------------------------------------------------------------------------------------------- |
| `size`  | `number \| string`    | `24`    | Sets both `width` and `height`. Accepts pixels or any CSS length (`"1em"`, `"1.25rem"`, …).        |
| `title` | `string \| undefined` | —       | When provided, the icon becomes `role="img"` with an accessible name. Omit it for decorative use. |
| …rest   | `SVGProps<SVGSVGElement>` | —   | Forwarded to the underlying `<svg>`.                                                               |

When `title` is omitted, the icon is rendered with `aria-hidden="true"` and `focusable="false"` so screen readers skip it.

## Available icons

The current set ships 12 icons covering the most common UI affordances. Browse them all (with search and copy-import) in the renderer at [`/icons`](../../apps/renderer/src/app/icons/page.tsx) — run `pnpm dev` and open `http://localhost:6008/icons`.

`ArrowUpRight`, `Check`, `ChevronDown`, `ChevronRight`, `Close`, `ErrorCircle`, `ExternalLink`, `Info`, `Minus`, `Plus`, `Search`, `Warning`.

> `ErrorCircle` is named to avoid shadowing JavaScript's built-in `Error` constructor.

## Building your own icons

`createIcon` is exported so you can mint icons that share the same defaults (viewBox, stroke width, a11y behaviour) as the bundled set:

```tsx
import { createIcon } from '@apx-ui/icons';

export const HeartLine = createIcon(
  'HeartLine',
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />,
);
```

## Iterating the full set

For tooling — pickers, docs, registries — every shipped icon is also exposed via a metadata manifest:

```ts
import { ICON_MANIFEST } from '@apx-ui/icons';

ICON_MANIFEST.forEach(({ name, Component, description, keywords }) => {
  // Render `<Component />`, index by `keywords`, etc.
});
```

Importing the manifest does not defeat tree-shaking for consumers that only use a couple of icons directly — it only references the same named exports they would import anyway.