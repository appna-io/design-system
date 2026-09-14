import { Div, Typography } from '@apx-ui/ds';

import { MockFrame } from './MockFrame';

/**
 * A terminal transcript — the half of a quickstart most docs omit: what actually happens when you
 * run the code above it.
 *
 * Lines starting `$` are the command; a leading two-space indent marks tool output, which is
 * dimmed. That is the whole formatting rule, and it is deliberately not more: a real transcript is
 * not a syntax-highlighted document, and pretending otherwise is how a mockup starts to look fake.
 */
export interface TerminalMockProps {
  lines: readonly string[];
  /** Shell name in the title bar. @default 'zsh' */
  title?: string;
}

export function TerminalMock({ lines, title = 'zsh' }: TerminalMockProps) {
  return (
    <MockFrame
      chrome="window"
      label={title}
      ariaLabel={`Terminal transcript: ${title}`}
      scrollable
      bodyClassName="p-4 text-sm leading-relaxed"
    >
      <Div as="pre">
        {lines.map((line, index) => {
          const isCommand = line.startsWith('$');
          const isOutput = line.startsWith('  ');
          return (
            <Typography
              // Transcript lines are positional and can legitimately repeat (blank lines), so the
              // index is the only stable key here — and the list never reorders.
              key={index}
              as="span"
              variant="bodySmall"
              fontFamily="display"
              color={isCommand ? undefined : isOutput ? 'fg.muted' : 'fg.subtle'}
              weight={isCommand ? 'semibold' : undefined}
              className="block whitespace-pre"
            >
              {line || ' '}
            </Typography>
          );
        })}
      </Div>
    </MockFrame>
  );
}
