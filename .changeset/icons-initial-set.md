---
'@apx-ui/icons': minor
'@apx-ui/ds': patch
---

`@apx-ui/icons`: ship the first batch of 12 tree-shakable SVG icon components
(`ArrowUpRight`, `Check`, `ChevronDown`, `ChevronRight`, `Close`, `ErrorCircle`,
`ExternalLink`, `Info`, `Minus`, `Plus`, `Search`, `Warning`) along with a
`createIcon` factory, a typed `IconProps` API (`size`, accessible `title`, full
native `<svg>` prop pass-through), and an `ICON_MANIFEST` for tooling. The
package is intentionally opt-in: `@apx-ui/ds` no longer depends on it, so
consumers only pay the bundle cost when they explicitly `pnpm add
@apx-ui/icons`.