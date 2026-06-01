import { useState, type FormEvent } from 'react';
import { Button, Div, Drawer, Input, Typography } from '@apx-ui/ds';

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
            <Div className="space-y-3">
              <Div className="block text-sm">
                <Typography as="span" variant="bodySmall" weight="medium" className="mb-1 block">
                  Project title
                </Typography>
                <Input
                  name="title"
                  placeholder="Helios platform redesign"
                  aria-label="Project title"
                  required
                />
              </Div>
              <Div className="block text-sm">
                <Typography as="span" variant="bodySmall" weight="medium" className="mb-1 block">
                  Owner email
                </Typography>
                <Input
                  name="owner"
                  type="email"
                  placeholder="owner@example.com"
                  aria-label="Owner email"
                />
              </Div>
              {submitted ? (
                <Typography variant="bodySmall" color="fg.success">
                  Created: {submitted}
                </Typography>
              ) : null}
            </Div>
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