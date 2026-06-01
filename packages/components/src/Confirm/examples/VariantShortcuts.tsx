import { useState } from 'react';
import { Button, Div, Typography, confirm } from '@apx-ui/ds';

/**
 * Each variant has a one-call shortcut so common confirms read like English. They are exactly
 * equivalent to <code>confirm.display(&#123; variant: '...', ... &#125;)</code> — pick
 * whichever reads better at the call site.
 */
export default function VariantShortcuts() {
  const [log, setLog] = useState<string[]>([]);

  function record(line: string): void {
    setLog((prev) => [line, ...prev].slice(0, 4));
  }

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Typography variant="body" color="fg.muted">
        Each variant has a one-call shortcut on the <code>confirm</code> facade — equivalent
        to <code>confirm.display(&#123; variant: &apos;...&apos;, ... &#125;)</code>.
      </Typography>

      <Div display="flex" flexWrap="wrap" gap="2">
        <Button
          color="info"
          onClick={async () => {
            const ok = await confirm.info({
              title: 'Mark all as read?',
              description: 'You can still find them in the archive.',
            });
            record(`confirm.info → ${String(ok)}`);
          }}
        >
          confirm.info
        </Button>

        <Button
          color="success"
          onClick={async () => {
            const ok = await confirm.success({
              title: 'Send invoice?',
              description: 'A copy will be emailed to the client.',
            });
            record(`confirm.success → ${String(ok)}`);
          }}
        >
          confirm.success
        </Button>

        <Button
          color="warning"
          onClick={async () => {
            const ok = await confirm.warning({
              title: 'Leave editor?',
              description: 'You have unsaved changes that will be lost.',
            });
            record(`confirm.warning → ${String(ok)}`);
          }}
        >
          confirm.warning
        </Button>

        <Button
          color="danger"
          onClick={async () => {
            const ok = await confirm.error({
              title: 'Remove team member?',
              description: 'They will lose access to all shared projects.',
            });
            record(`confirm.error → ${String(ok)}`);
          }}
        >
          confirm.error
        </Button>
      </Div>

      {log.length > 0 ? (
        <Div display="flex" flexDirection="column" gap="1">
          {log.map((line, i) => (
            <Typography key={i} variant="caption" color="fg.muted">
              {line}
            </Typography>
          ))}
        </Div>
      ) : null}
    </Div>
  );
}