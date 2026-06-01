import { Card } from '@apx-ui/ds';

export default function WithDivider() {
  return (
    <Card className="max-w-md" variant="outline">
      <Card.Header title="Account" subtitle="Personal details" />
      <Card.Divider />
      <Card.Body>
        `Card.Divider` renders a semantic horizontal rule between regions so screen-reader users
        hear the section change.
      </Card.Body>
      <Card.Divider />
      <Card.Footer align="end">Save changes</Card.Footer>
    </Card>
  );
}