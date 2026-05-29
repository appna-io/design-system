import { Button, Input, Modal } from 'apx-ds';
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
            <div className="space-y-3">
              <div className="block text-sm">
                <span className="mb-1 block font-medium">Display name</span>
                <Input
                  name="name"
                  placeholder="Sam Pullman"
                  aria-label="Display name"
                  required
                />
              </div>
              <div className="block text-sm">
                <span className="mb-1 block font-medium">Email</span>
                <Input
                  name="email"
                  type="email"
                  placeholder="sam@example.com"
                  aria-label="Email"
                />
              </div>
              {submitted ? (
                <p className="text-sm text-fg-success">
                  Saved: {submitted}
                </p>
              ) : null}
            </div>
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
