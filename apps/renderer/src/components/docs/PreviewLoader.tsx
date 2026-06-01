'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

import { getExampleLoader } from '../../generated/exampleRegistry';
import { PreviewBoundary } from './ErrorBoundary';

interface PreviewLoaderProps {
  dirName: string;
  exampleId: string;
}

/**
 * Loads `packages/components/src/<DirName>/examples/<ExampleId>.tsx` via the generated example
 * registry. Each entry in the registry is a static `import()`, so webpack code-splits one chunk
 * per example — visiting one component page no longer triggers compilation of every example.
 *
 * If the registry hasn't seen this example (e.g. a new file was added without a dev-server
 * restart), we render a helpful inline notice instead of crashing.
 */
export function PreviewLoader({ dirName, exampleId }: PreviewLoaderProps) {
  const loader = getExampleLoader(dirName, exampleId);

  const Comp = useMemo(() => {
    if (!loader) {
      return function MissingExample() {
        return <RegistryMissNotice dirName={dirName} exampleId={exampleId} />;
      };
    }
    return dynamic(
      () =>
        loader().then((mod) => {
          const Default =
            (mod as { default?: React.ComponentType }).default ??
            (mod as Record<string, React.ComponentType>)[exampleId];
          return { default: (Default ?? (() => null)) as React.ComponentType };
        }),
      {
        ssr: false,
        loading: () => <PreviewSkeleton />,
      },
    );
  }, [loader, dirName, exampleId]);

  return (
    <PreviewBoundary label={exampleId}>
      <Comp />
    </PreviewBoundary>
  );
}

function RegistryMissNotice({ dirName, exampleId }: PreviewLoaderProps) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-1 rounded-md border border-dashed border-warning bg-warning-subtle/30 px-3 py-2 text-xs text-fg"
    >
      <span className="font-semibold">Example not in registry</span>
      <span className="text-fg-muted">
        Restart the dev server to pick up <code>{dirName}/{exampleId}.tsx</code>.
      </span>
    </div>
  );
}

function PreviewSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading preview"
      className="flex h-24 items-center justify-center rounded-md border border-dashed border-border text-xs text-fg-muted"
    >
      Loading preview…
    </div>
  );
}