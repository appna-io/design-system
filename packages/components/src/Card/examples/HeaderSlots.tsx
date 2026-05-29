import { Avatar, Badge, Button, Card } from '@apx-ui/ds';

export default function HeaderSlots() {
  return (
    <Card className="max-w-md" variant="elevated">
      <Card.Header
        avatar={<Avatar name="Ada Lovelace" />}
        title="Ada Lovelace"
        subtitle="Senior engineer · Analytical Engine"
        action={
          <Button size="sm" variant="ghost">
            Follow
          </Button>
        }
      />
      <Card.Body>
        Header has dedicated `avatar`, `title`, `subtitle`, and `action` slots so a11y stays
        consistent across every Card in the product. Add a <Badge size="sm">Badge</Badge> inline
        with `title` for extra context.
      </Card.Body>
    </Card>
  );
}
