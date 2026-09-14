import { Typography } from '@apx-ui/ds';

import { MockFrame } from './MockFrame';

/**
 * A code sample, in the kit's frame.
 *
 * **Deliberately not syntax-highlighted.** The renderer ships Shiki for its own source viewer, so
 * highlighting was available — and using it would be wrong for a template. A template is a thing
 * someone copies into their own project, and one whose code blocks depend on a highlighter either
 * drags Shiki along or renders as unstyled text. Plain mono in the DS's own tokens works
 * everywhere, re-themes with the palette, and is what a real docs site falls back to anyway.
 *
 * The `whitespace-pre` is load-bearing: `Typography` is not a `<pre>`, and without it every code
 * sample collapses to one line.
 */
export interface CodeMockProps {
  code: string;
  /** Title-bar text — a filename or a command. Omit for a bare frame. */
  label?: string;
  /** Accessible name for the scroll region. Falls back to `label`. */
  ariaLabel?: string;
}

export function CodeMock({ code, label, ariaLabel }: CodeMockProps) {
  return (
    <MockFrame
      chrome="panel"
      {...(label ? { label } : {})}
      {...(ariaLabel ? { ariaLabel } : {})}
      scrollable
      bodyClassName="p-4 text-sm leading-relaxed"
    >
      <Typography as="pre" variant="bodySmall" fontFamily="display" className="whitespace-pre">
        <Typography as="code" variant="bodySmall" fontFamily="display">
          {code}
        </Typography>
      </Typography>
    </MockFrame>
  );
}
