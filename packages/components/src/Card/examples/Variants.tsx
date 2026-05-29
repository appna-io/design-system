import { Card } from 'apx-ds';

export default function Variants() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Card variant="outline">
        <Card.Header title="Outline" subtitle="Default" />
        <Card.Body>1px border + paper background. The conventional shell.</Card.Body>
      </Card>
      <Card variant="solid">
        <Card.Header title="Solid" subtitle="Quiet" />
        <Card.Body>Subtle fill, no border. Pairs well with dense dashboards.</Card.Body>
      </Card>
      <Card variant="elevated">
        <Card.Header title="Elevated" subtitle="Surfaced" />
        <Card.Body>Paper background + shadow. What Modals look like internally.</Card.Body>
      </Card>
      <Card variant="ghost" hoverable>
        <Card.Header title="Ghost" subtitle="Hover to reveal" />
        <Card.Body>No edge, no fill. Frame only appears on hover.</Card.Body>
      </Card>
    </div>
  );
}
