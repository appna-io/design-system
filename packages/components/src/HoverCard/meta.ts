import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'hover-card',
  displayName: 'HoverCard',
  description:
    "Hover-triggered rich preview overlay — the canonical \u201cGitHub user card\u201d / \u201clink preview\u201d / \u201cdefinition popup\u201d primitive. Compound API (`HoverCard.Trigger` / `Content` / `Arrow`) reuses Popover's positioning engine + Tooltip's hover-delay state machine. Additive (no focus trap, no backdrop) — hover/focus opens, pointer leave + blur close, Esc dismisses the topmost card.",
  category: 'Overlays',
  tags: ['hover-card', 'overlay', 'preview', 'popover', 'tooltip', 'floating'],
};