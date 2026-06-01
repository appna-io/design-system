import { Button, Div, Input, Modal, Typography } from '@apx-ui/ds';
import { useState, type FormEvent } from 'react';

export default function FormInside() {
  const [submitted, setSubmitted] = useState<string | null>(null);
  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitted(String(formData.get('name') ?? ''));
  };

  return (
    <Modal>
      <Modal.Trigger>
        <Button>Edit profile</Button>
      </Modal.Trigger>
      <Modal.Content size="md">
        <Modal.Close />
        <Modal.Header
          title="Edit profile"
          description="Updates apply immediately."
        />
        <form onSubmit={handleSubmit}>
          <Modal.Body>
            <Div display="flex" flexDirection="column" gap="3">
              <Div className="block text-sm">
                <Typography as="span" variant="bodySmall" weight="medium" className="mb-1 block">
                  Display name
                </Typography>
                <Input
                  name="name"
                  placeholder="Sam Pullman"
                  aria-label="Display name"
                  required
                />
              </Div>
              <Div className="block text-sm">
                <Typography as="span" variant="bodySmall" weight="medium" className="mb-1 block">
                  Email
                </Typography>
                <Input
                  name="email"
                  type="email"
                  placeholder="sam@example.com"
                  aria-label="Email"
                />
              </Div>
              {submitted ? (
                <Typography variant="bodySmall" color="fg.success">
                  Saved: {submitted}
                </Typography>
              ) : null}
            </Div>
          </Modal.Body>
          <Modal.Footer>
            <Modal.Close asChild>
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </Modal.Close>
            <Button type="submit">Save</Button>
          </Modal.Footer>
        </form>
      </Modal.Content>
    </Modal>
  );
}