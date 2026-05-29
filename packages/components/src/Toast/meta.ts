import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'toast',
  displayName: 'Toast',
  description:
    'Transient notification primitive with an imperative API. `<Toaster />` mounts the queue once; `toast(\u2026)` fires notifications from anywhere — React components, hooks, or plain JS (e.g. fetch interceptors). Supports intents, action buttons, promise integration, dedup-by-id, hover/focus-loss pause, and F8 keyboard focus.',
  category: 'Feedback',
  tags: ['toast', 'notification', 'snackbar', 'feedback'],
};
