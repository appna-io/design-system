import { useState } from 'react';
import { Button, Div, Typography, confirm } from '@apx-ui/ds';

/**
 * The minimal call — open a confirm with a title + description and await the user's choice.
 * No variant means `default` (neutral icon + primary confirm button).
 */
export default function Basic() {
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    const ok = await confirm.display({
      title: 'Save changes?',
      description: 'Your draft will be replaced by the new version.',
      confirmText: 'Save',
    });
    setMessage(ok ? 'Saved.' : 'Cancelled.');
  }

  return (
    <Div display="flex" flexDirection="column" gap="3" alignItems="flex-start">
      <Button onClick={onClick}>Save changes</Button>
      {message ? (
        <Typography variant="bodySmall" color="fg.muted">
          {message}
        </Typography>
      ) : null}
    </Div>
  );
}