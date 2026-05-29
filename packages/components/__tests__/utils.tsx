import { ThemeProvider } from '@apx-ui/theme';
import { render, type RenderOptions, type RenderResult } from '@testing-library/react';
import { type ReactElement, type ReactNode } from 'react';

function Wrapper({ children }: { children: ReactNode }) {
  return <ThemeProvider storageKey={null}>{children}</ThemeProvider>;
}

/**
 * `render` that automatically wraps the tree in `<ThemeProvider storageKey={null}>` so DS
 * components have access to `useTheme()` / `useThemedClasses()` without each test setting it up.
 * The `storageKey={null}` opt-out keeps tests isolated from each other's persisted state.
 */
export function renderWithTheme(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
): RenderResult {
  return render(ui, { wrapper: Wrapper, ...options });
}
