import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ThemeProvider, ThemeScript } from 'apx-ds';
import 'apx-ds/styles/reset.css';
import './globals.css';

import { Chrome } from '../components/chrome/Chrome';
import { RouteProgress } from '../components/chrome/RouteProgress';

export const metadata: Metadata = {
  title: 'APX DS · Renderer',
  description: 'Local development preview for the apx-ds component library',
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
          to a single element — it does not silence mismatches inside our own tree. */}
      <body suppressHydrationWarning>
        <ThemeProvider>
          <RouteProgress />
          <Chrome>{children}</Chrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
