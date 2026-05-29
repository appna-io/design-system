import { Button, Drawer } from 'apx-ds';

export default function BottomSheet() {
  return (
    <Drawer>
      <Drawer.Trigger>
        <Button>Share</Button>
      </Drawer.Trigger>
      <Drawer.Content side="bottom" size="md">
        <Drawer.Close />
        <Drawer.Header title="Share with..." />
        <Drawer.Body>
          <div className="grid grid-cols-3 gap-3">
            {['Mail', 'Slack', 'Copy link', 'Twitter', 'LinkedIn', 'More'].map(
              (option) => (
                <Button key={option} variant="outline" size="sm">
                  {option}
                </Button>
              ),
            )}
          </div>
        </Drawer.Body>
        <Drawer.Footer align="between">
          <Drawer.Close asChild>
            <Button variant="ghost">Cancel</Button>
          </Drawer.Close>
        </Drawer.Footer>
      </Drawer.Content>
    </Drawer>
  );
}
