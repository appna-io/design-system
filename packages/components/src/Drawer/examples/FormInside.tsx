import { useState, type FormEvent } from 'react';
import { Button, Drawer, Input } from '@apx-ui/ds';

export default function FormInside() {
  const [submitted, setSubmitted] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSubmitted(String(formData.get('title') ?? ''));
  };

  return (
    <Drawer>
      <Drawer.Trigger>
        <Button>New project</Button>
      </Drawer.Trigger>
      <Drawer.Content side="right" size="lg">
        <Drawer.Close />
        <Drawer.Header
          title="New project"
          description="Fill in the basics — you can refine later."
        />
        <form onSubmit={handleSubmit}>
          <Drawer.Body>
            <div className="space-y-3">
              <div className="block text-sm">
                <span className="mb-1 block font-medium">Project title</span>
                <Input
                  name="title"
                  placeholder="Helios platform redesign"
                  aria-label="Project title"
                  required
                />
              </div>
              <div className="block text-sm">
                <span className="mb-1 block font-medium">Owner email</span>
                <Input
                  name="owner"
                  type="email"
                  placeholder="owner@example.com"
                  aria-label="Owner email"
                />
              </div>
              {submitted ? (
                <p className="text-sm text-fg-success">
                  Created: {submitted}
                </p>
              ) : null}
            </div>
          </Drawer.Body>
          <Drawer.Footer>
            <Drawer.Close asChild>
              <Button variant="ghost" type="button">
                Cancel
              </Button>
            </Drawer.Close>
            <Button type="submit">Create</Button>
          </Drawer.Footer>
        </form>
      </Drawer.Content>
    </Drawer>
  );
}
