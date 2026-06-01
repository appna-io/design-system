import { Button, Card } from '@apx-ui/ds';

/**
 * One polished card with header, body, and footer — a realistic deployment summary tile.
 */
export default function Overview() {
  return (
    <Card className="max-w-md" variant="elevated" color="primary">
      <Card.Header
        title="Production deploy"
        subtitle="api-gateway · us-east-1 · 2 minutes ago"
      />
      <Card.Body>
        Version <strong>v2.14.0</strong> rolled out to 100% of traffic. Health checks passed
        and error rates remain within SLO.
      </Card.Body>
      <Card.Footer align="end">
        <Button variant="ghost" size="sm">
          View logs
        </Button>
        <Button size="sm">Open dashboard</Button>
      </Card.Footer>
    </Card>
  );
}