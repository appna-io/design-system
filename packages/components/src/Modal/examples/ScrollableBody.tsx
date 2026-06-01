import { Button, Div, Modal, Typography } from '@apx-ui/ds';

export default function ScrollableBody() {
  const paragraphs = Array.from({ length: 30 }, (_, i) => i + 1);
  return (
    <Modal>
      <Modal.Trigger>
        <Button>Open long modal</Button>
      </Modal.Trigger>
      <Modal.Content size="md">
        <Modal.Close />
        <Modal.Header
          title="Terms of service"
          description="Read carefully before continuing."
        />
        <Modal.Body>
          <Div display="flex" flexDirection="column" gap="3">
            {paragraphs.map((n) => (
              <Typography key={n} variant="bodySmall">
                Section {n}. Content scrolls inside the Body region while the
                Header and Footer stay pinned. The dialog&apos;s `max-h-[calc(100vh-4rem)]`
                keeps it inside the viewport regardless of content height.
              </Typography>
            ))}
          </Div>
        </Modal.Body>
        <Modal.Footer>
          <Modal.Close asChild>
            <Button variant="ghost">Decline</Button>
          </Modal.Close>
          <Button>Accept</Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}