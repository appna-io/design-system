import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ConfirmProvider, SplashProvider, ThemeProvider, ThemeScript } from '@apx-ui/ds';
import '@apx-ui/ds/styles/reset.css';
import './globals.css';

import { Chrome } from '../components/chrome/Chrome';
import { PortalSizeProvider } from '../components/chrome/portal-size-context';
import { RouteProgress } from '../components/chrome/RouteProgress';
import { FirebaseAnalytics } from '../components/FirebaseAnalytics';
import { UnderDevelopmentBanner } from '../components/UnderDevelopmentBanner';

export const metadata: Metadata = {
  title: 'APX DS · Renderer',
  description: 'Local development preview for the apx-ds component library',
  // AppNA brand mark. Drop the matching files in `apps/renderer/public/`
  // (see the note in `public/README.md`) and these references light up.
  icons: {
    icon: [{ url: '/appna-icon.svg', type: 'image/svg+xml' }, { url: '/favicon.ico' }],
    apple: '/appna-icon.svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      {/* `suppressHydrationWarning` mirrors the one on `<html>`: browser extensions like
          ColorZilla / Grammarly / LastPass inject attributes (`cz-shortcut-listen`, `data-gr-*`,
          etc.) on the `<body>` after the server-rendered HTML lands but before React hydrates,
          which trips a hydration mismatch warning we can't fix at our end. The flag is scoped
          to a single element — it does not silence mismatches inside our own tree.

          `dir="ltr"` pins the renderer chrome (sidebar, topbar, code blocks, prose, props
          tables, the Theme Studio drawer that portals here, etc.) to LTR regardless of what
          the `ThemeProvider` has written to `<html dir>`. The Direction toggle in the topbar
          is a *preview* control: it should flip the live component example only — never the
          docs surface or the source listing — so we override the inherited direction here and
          re-apply the user's choice locally inside `ExampleViewer`. */}
      <body dir="ltr" suppressHydrationWarning>
        <ThemeProvider>
          {/* `<SplashProvider>` is the imperative host that powers `splash.show(...)` calls
              from anywhere in the app. Mounted here once next to `<ThemeProvider>` so every
              page (and every example component) can fire a splash without wiring its own
              state. See `@apx-ui/ds`'s SplashScreen docs for the full API. */}
          <SplashProvider />
          {/* `<ConfirmProvider>` is the imperative host that powers `confirm.display(...)`
              calls from anywhere in the app. Mounted here once next to `<SplashProvider>`
              so every page (and every example component) can open a confirm dialog without
              wiring its own state. See `@apx-ui/ds`'s Confirm docs for the full API. */}
          <ConfirmProvider />
          <RouteProgress />
          {/* `<PortalSizeProvider>` sits between the theme and the chrome so the renderer's
              top bar and the floating template-preview toolbar can both flip the simulated
              viewport width that `<ChromeShell>` / the template page apply to the content
              column further down the tree. */}
          <FirebaseAnalytics />
          <UnderDevelopmentBanner />
          <PortalSizeProvider>
            <Chrome>{children}</Chrome>
          </PortalSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}