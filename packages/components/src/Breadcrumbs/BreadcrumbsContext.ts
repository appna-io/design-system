'use client';

import { createContext, useContext } from 'react';

import type { BreadcrumbsContextValue } from './Breadcrumbs.types';

/**
 * Context that flows resolved variant / size / color / separator info from `<Breadcrumbs>` to
 * `<Breadcrumbs.Item>` and `<Breadcrumbs.Separator>` subparts. Throws on misuse — the most
 * common authoring mistake is using a subpart outside the root.
 */
export const BreadcrumbsContext = createContext<BreadcrumbsContextValue | null>(null);

export function useBreadcrumbsContext(componentName: string): BreadcrumbsContextValue {
  const ctx = useContext(BreadcrumbsContext);
  if (!ctx) {
    throw new Error(
      `[apx-ds] <${componentName}> must be rendered inside a <Breadcrumbs> ancestor.`,
    );
  }
  return ctx;
}
