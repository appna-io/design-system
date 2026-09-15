---
'@apx-ui/components': patch
---

`Accordion`: fix the lag when opening and closing an item. The collapsing grid item used to
carry the content padding, which stopped it from reaching zero height. A `max-height: 0 → 100vh`
transition hid the leftover strip, but on close the panel paused on that padding for about
half the animation. The padding now sits on the `role="region"` inside a new unpadded
`contentClip` element, and the `max-height` cap is gone, so opening and closing both animate
smoothly. The region keeps receiving `className` / `sx` / `style` / `ref`. A new theme slot,
`styleOverrides.contentClip`, is available.
