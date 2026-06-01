import { useState } from 'react';
import { Button, Div, Typography, confirm, toast } from '@apx-ui/ds';

/**
 * The canonical "guard a destructive action with a confirm dialog" pattern. The async function
 * `await`s the dialog, bails out on cancel, then runs the real work and surfaces feedback via
 * a toast. No state wiring, no callbacks, no `useState` for `open` — just a linear function.
 */
export default function AsyncFlow() {
  const [busy, setBusy] = useState(false);

  async function deleteAccount() {
    const ok = await confirm.display({
      variant: 'error',
      title: 'Delete account?',
      description:
        'Your projects, settings, and history will be removed within 24 hours. This action cannot be undone.',
      confirmText: 'Yes, delete',
      cancelText: 'Keep account',
      closeOnBackdropClick: false,
    });

    if (!ok) return;

    setBusy(true);
    try {
      await new Promise((resolve) => window.setTimeout(resolve, 800));
      toast.success('Account scheduled for deletion.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start" style={{ maxWidth: 540 }}>
      <Typography variant="body">
        Guard a destructive action with a confirm dialog. We disable backdrop dismiss
        (<code>closeOnBackdropClick: false</code>) so an accidental click outside doesn&apos;t
        feel like a cancel — the user has to take an explicit choice.
      </Typography>

      <Button color="danger" loading={busy} onClick={deleteAccount}>
        Delete account
      </Button>
    </Div>
  );
}