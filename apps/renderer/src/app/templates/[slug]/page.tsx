import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import {
  InspectorBanner,
  InspectorProvider,
  SourceModal,
} from '../../../components/templates/inspector';
import { PreviewToolbar } from '../../../components/templates/PreviewToolbar';
import { loadInspectableSources } from '../../../lib/templateInspector';
import { getTemplateBySlug, getTemplateSlugs } from '../../../templates';

interface PreviewPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getTemplateSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PreviewPageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getTemplateBySlug(slug);
  if (!entry) return { title: 'Template not found · Renderer' };
  return {
    title: `${entry.meta.name} · Templates`,
    description: entry.meta.description,
  };
}

/**
 * Renders one registered template full-bleed. The parent `<ChromeShell>` detects the
 * `/templates/<slug>` path and skips the docs sidebar so the template owns the entire
 * viewport.
 *
 * Inspectable section source code is read from disk on the server and Shiki-highlighted
 * once per request; the resulting HTML is passed down to a client `<InspectorProvider>`
 * so the modal can render without shipping the highlighter to the browser. The floating
 * `<PreviewToolbar>` (which itself reads from the inspector context) gets a toggle for
 * the new inspector mode; the `<InspectorBanner>` is a small top-of-viewport hint that
 * stays visible while inspector mode is engaged.
 */
export default async function TemplatePreviewPage({ params }: PreviewPageProps) {
  const { slug } = await params;
  const entry = getTemplateBySlug(slug);
  if (!entry) notFound();

  const { Component, meta } = entry;
  const sources = await loadInspectableSources(meta);

  return (
    <InspectorProvider sources={sources}>
      <Component />
      <InspectorBanner />
      <SourceModal />
      <PreviewToolbar meta={meta} />
    </InspectorProvider>
  );
}