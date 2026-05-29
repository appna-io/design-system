import { highlight } from '../../lib/shiki';
import { CopyButton } from '../primitives/CopyButton';
import { cn } from '../primitives/cn';

interface CodeBlockProps {
  code: string;
  lang?: string;
  fileName?: string;
  /** When false, hides the copy button. Defaults to true. */
  copyable?: boolean;
  /** When true, drops the outer rounded border + filename/copy header. Use when the CodeBlock is
   *  embedded inside another framed container (e.g. `ExampleViewer`) that already provides them. */
  bare?: boolean;
  className?: string;
}

/**
 * Server component. Pre-renders syntax-highlighted HTML in both light and dark themes; the
 * `[data-mode]` attribute on `<html>` (set by ThemeProvider) decides which one is visible at
 * runtime, so we never re-highlight on the client.
 */
export async function CodeBlock({
  code,
  lang = 'tsx',
  fileName,
  copyable = true,
  bare = false,
  className,
}: CodeBlockProps) {
  const { light, dark } = await highlight(code.trim(), lang);
  const showHeader = !bare && (fileName || copyable);
  return (
    <div
      className={cn(
        'group relative overflow-hidden',
        !bare && 'rounded-lg border border-border',
        className,
      )}
    >
      {showHeader && (
        <div className="flex items-center justify-between border-b border-border bg-bg-paper px-3 py-1.5">
          <span className="text-xs font-medium text-fg-muted">{fileName ?? lang}</span>
          {copyable && <CopyButton text={code} />}
        </div>
      )}
      <div
        className="renderer-code-light bg-bg-paper"
        dangerouslySetInnerHTML={{ __html: light }}
      />
      <div className="renderer-code-dark bg-bg-paper" dangerouslySetInnerHTML={{ __html: dark }} />
    </div>
  );
}
