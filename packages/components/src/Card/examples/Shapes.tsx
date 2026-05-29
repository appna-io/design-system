import { Card } from 'apx-ds';

export default function Shapes() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card shape="square">
        <Card.Header title="Square" subtitle="rounded-none" />
        <Card.Body>Architectural, brutalist surfaces. No corner rounding.</Card.Body>
      </Card>
      <Card shape="rounded">
        <Card.Header title="Rounded" subtitle="Default" />
        <Card.Body>The DS-wide default radius. Friendly without being playful.</Card.Body>
      </Card>
      <Card shape="pill">
        <Card.Header title="Pill" subtitle="rounded-2xl" />
        <Card.Body>Generous radius for marketing cards and feature spotlights.</Card.Body>
      </Card>
    </div>
  );
}
