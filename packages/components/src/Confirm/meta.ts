import type { ComponentMeta } from '@apx-ui/engine';

export const meta: ComponentMeta = {
  name: 'confirm',
  displayName: 'Confirm',
  description:
    "Imperative confirm dialog. Call `confirm.display({ ... })` from anywhere and `await` the user's choice — the promise resolves to `true` (confirm) or `false` (cancel / Escape / backdrop). Powered by `<ConfirmProvider>`, the singleton host mounted once at the app root next to `<ThemeProvider>` (mirrors the `SplashProvider` + `splash(...)` pattern). Five semantic variants (default / info / success / warning / error), opt-in leading icon, customizable button labels, focus-trapped + scroll-locked + Escape-to-cancel + click-backdrop-to-cancel.",
  category: 'Overlays',
  tags: [
    'confirm',
    'dialog',
    'alertdialog',
    'overlay',
    'imperative',
    'provider',
    'promise',
    'modal',
  ],
};