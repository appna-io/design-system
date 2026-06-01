import { Button, Toolbar } from '@apx-ui/ds';

export default function Vertical() {
  return (
    <Toolbar
      orientation="vertical"
      variant="bordered"
      aria-label="Quick actions"
      className="w-12"
    >
      <Button variant="ghost" aria-label="Search">
        🔍
      </Button>
      <Button variant="ghost" aria-label="Notifications">
        🔔
      </Button>
      <Button variant="ghost" aria-label="Inbox">
        📥
      </Button>
      <Toolbar.Separator />
      <Button variant="ghost" aria-label="Profile">
        👤
      </Button>
    </Toolbar>
  );
}