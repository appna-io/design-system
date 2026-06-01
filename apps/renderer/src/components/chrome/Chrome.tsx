import { type ReactNode } from 'react';

import { discoverComponents } from '../../lib/discover';
import { ChromeShell } from './ChromeShell';

interface ChromeProps {
  children: ReactNode;
}

/**
 * Server component. Loads the component list once per request and hands a slim shape to the
 * client-side ChromeShell, which decides — based on the current pathname — whether to render
 * the docs sidebar + page chrome or hand the route a full-bleed canvas (used by the template
 * preview viewer).
 */
export async function Chrome({ children }: ChromeProps) {
  const components = await discoverComponents();
  const slim = components.map((c) => ({ slug: c.slug, meta: c.meta }));

  return <ChromeShell components={slim}>{children}</ChromeShell>;
}