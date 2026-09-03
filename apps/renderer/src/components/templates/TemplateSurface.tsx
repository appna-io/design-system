'use client';

import {
  DirectionProvider,
  Div,
  ThemeProvider,
  useThemeDirection,
  type ThemeOverride,
} from '@apx-ui/ds';
import { type ReactNode } from 'react';

import { TemplateThemePanel } from './TemplateThemePanel';

interface TemplateSurfaceProps {
  /** The template's default brand theme, seeded into the scope. See `TemplateMeta.theme`. */
  theme?: ThemeOverride | undefined;
  children: ReactNode;
}

/**
 * The environment a full-page template preview renders inside. Owns the two things the
 * template itself must not reach out and set globally:
 *
 * **Direction.** The renderer's `<body>` is pinned to `dir="ltr"` so the docs chrome never
 * flips (see `app/layout.tsx`). `<ExampleViewer>` re-applies the user's choice on its own
 * preview frame; a template preview had no equivalent, so the toolbar's LTR/RTL toggle wrote
 * the setting and then visibly did nothing. We mirror ExampleViewer here: a `dir` attribute so
 * CSS logical properties resolve, plus a `<DirectionProvider>` so components calling
 * `useDirection()` agree without reading `<html dir>`.
 *
 * **Brand theme.** Every template gets a scoped `<ThemeProvider>`, which writes its variables
 * to a wrapper element instead of `document.documentElement` — so a template's palette reaches
 * every DS component inside it and nothing in the docs chrome outside it. The scope is
 * unconditional even for a template with no theme of its own, because it is also what gives
 * `<TemplateThemePanel>` something template-local to edit: the panel renders *inside* the
 * provider, so its `useThemeOverrides()` targets this template rather than the whole site.
 *
 * `theme` only seeds the scope, so the panel can edit freely on top of it, and scoped overrides
 * are never persisted — leaving the page resets it to the template's own defaults. Mode,
 * direction and variant are inherited from the ancestor, so the preview toolbar's toggles keep
 * working inside a branded template.
 */
export function TemplateSurface({ theme, children }: TemplateSurfaceProps) {
  const { dir } = useThemeDirection();

  return (
    <ThemeProvider scope defaultOverrides={theme ?? {}}>
      <DirectionProvider dir={dir}>
        <Div dir={dir}>{children}</Div>
        <TemplateThemePanel />
      </DirectionProvider>
    </ThemeProvider>
  );
}
