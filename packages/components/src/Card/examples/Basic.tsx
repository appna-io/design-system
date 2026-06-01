import { Card } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Card className="max-w-sm">
      <Card.Header title="Project Apollo" subtitle="Updated 3 minutes ago" />
      <Card.Body>The mission is to put humans on the moon and return them safely.</Card.Body>
    </Card>
  );
}