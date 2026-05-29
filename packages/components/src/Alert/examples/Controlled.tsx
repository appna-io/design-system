import { useState } from 'react';
import { Alert, Button } from 'apx-ds';

export default function Controlled() {
  const [open, setOpen] = useState(true);

  return (
    <div className="flex flex-col gap-3">
      <Alert
        open={open}
        onClose={() => setOpen(false)}
        closable
        color="success"
      >
        <Alert.Title>Controlled</Alert.Title>
        <Alert.Description>
          The parent owns the open state. Click ×, then use the button below to bring it back.
        </Alert.Description>
      </Alert>
      {!open ? (
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
          Show alert again
        </Button>
      ) : null}
    </div>
  );
}
