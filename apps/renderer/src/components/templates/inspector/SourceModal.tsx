'use client';

import { Div, Modal, Typography } from '@apx-ui/ds';
import { Code2 } from 'lucide-react';

import { CopyButton } from '../../primitives/CopyButton';
import { useInspector } from './inspector-context';

/**
 * Modal that pops open when the user clicks an inspectable section while inspector
 * mode is on. The HTML for both light + dark themes is pre-rendered server-side
 * (see `/templates/[slug]/page.tsx` + `lib/shiki.ts`) so there's no client-side
 * Shiki bundle on the critical path.
 */
export function SourceModal() {
  const { openId, sources, closeSource } = useInspector();
  const open = openId !== null;
  const current = openId ? sources[openId] : undefined;

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (!next) closeSource();
      }}
    >
      <Modal.Content size="xl" placement="center">
        {/* `Modal.Close` is absolutely positioned at the top-right of the dialog — the
            canonical "close this dialog" affordance. Keep the header's `action` slot
            empty so nothing collides with it; content-specific controls (copy code,
            language switcher, etc.) live with the content, not in the chrome. */}
        <Modal.Close />
        <Modal.Header
          avatar={
            <Div
              as="span"
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary-subtle text-primary"
            >
              <Code2 size={18} />
            </Div>
          }
          title={current?.label ?? 'Source'}
          description={
            current ? (
              <Typography as="span" variant="caption" fontFamily="mono" color="fg.muted">
                {current.file}
              </Typography>
            ) : undefined
          }
        />
        <Modal.Body className="!p-0">
          {current ? (
            <Div className="relative border-t border-border bg-bg-paper">
              {/* Copy floats over the code surface (next to what you'd actually copy)
                  rather than colliding with the Modal.Close button in the chrome. The
                  button stays fixed at the top-right while the code scrolls underneath. */}
              <CopyButton
                text={current.raw}
                className="absolute end-3 top-3 z-10 shadow-sm"
              />
              <Div className="max-h-[70vh] overflow-auto">
                {/* The pair of pre-rendered HTML blocks share the same Shiki output and
                    are toggled by the global `[data-mode]` switch on `<html>` (see the
                    rules in `globals.css`). Zero client-side highlighting. */}
                <Div
                  className="renderer-code-light"
                  dangerouslySetInnerHTML={{ __html: current.light }}
                />
                <Div
                  className="renderer-code-dark"
                  dangerouslySetInnerHTML={{ __html: current.dark }}
                />
              </Div>
            </Div>
          ) : (
            <Typography variant="bodySmall" color="fg.muted" className="p-6">
              No source available.
            </Typography>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal>
  );
}