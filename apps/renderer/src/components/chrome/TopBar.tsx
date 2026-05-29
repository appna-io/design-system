import type { ReactNode } from 'react';

import { ThemeStudio } from '../studio/ThemeStudio';
import { DirectionToggle } from './DirectionToggle';
import { ModeToggle } from './ModeToggle';
import { VariantSelect } from './VariantSelect';

interface TopBarProps {
  title?: ReactNode;
  /** Optional override controls injected by a specific page (e.g. component-level variant). */
  children?: ReactNode;
}

export function TopBar({ title, children }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-border bg-bg/85 px-6 backdrop-blur">
      <div className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{title}</div>
      <div className="flex items-center gap-3">
        {children}
        <VariantSelect />
        <DirectionToggle />
        <ModeToggle />
        <ThemeStudio />
      </div>
    </header>
  );
}
