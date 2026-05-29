import { useState } from 'react';
import { Button, Toolbar } from 'apx-ds';

export default function WithSpacer() {
  const [draft, setDraft] = useState(true);

  return (
    <Toolbar variant="bordered" aria-label="Page actions">
      <Button variant="ghost">Back</Button>
      <Toolbar.Separator />
      <Button variant="ghost">Settings</Button>

      <Toolbar.Spacer />

      <Button variant="ghost" onClick={() => setDraft(true)}>
        Save draft
      </Button>
      <Button
        variant="solid"
        color="primary"
        onClick={() => setDraft(false)}
      >
        {draft ? 'Publish' : 'Published'}
      </Button>
    </Toolbar>
  );
}
