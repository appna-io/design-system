import { CodeBlock } from './CodeBlock';
import { ExampleViewer } from './ExampleViewer';
import { PreviewLoader } from './PreviewLoader';

interface ExampleBlockProps {
  /** Directory name of the component, e.g. `Placeholder`. */
  dirName: string;
  /** Example id (basename without extension), e.g. `Basic`. */
  exampleId: string;
  /** Raw example source, displayed in the Code tab. */
  source: string;
  /** Optional human label; defaults to the example id. */
  title?: string;
}

/**
 * Composes a labeled preview tile with the live component rendering + its source. The preview
 * itself is server-rendered (`PreviewLoader` boots up the client-side dynamic import), while the
 * Show/Hide Code toggle lives in the `ExampleViewer` client component.
 */
export function ExampleBlock({ dirName, exampleId, source, title }: ExampleBlockProps) {
  const label = title ?? exampleId;
  const file = `${exampleId}.tsx`;
  return (
    <section className="space-y-3">
      <header className="flex items-baseline justify-between gap-3">
        <h3 className="text-base font-semibold text-fg">{label}</h3>
      </header>
      <ExampleViewer
        preview={<PreviewLoader dirName={dirName} exampleId={exampleId} />}
        code={<CodeBlock code={source} lang="tsx" bare />}
        source={source}
        fileName={file}
      />
    </section>
  );
}
