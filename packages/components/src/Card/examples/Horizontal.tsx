import { Card } from 'apx-ds';

export default function Horizontal() {
  return (
    <Card orientation="horizontal" variant="outline" className="max-w-2xl">
      <Card.Media
        src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=480&q=80"
        alt="Electronics on a workbench"
      />
      <div className="flex flex-1 flex-col">
        <Card.Header title="Workbench" subtitle="Hardware notes" />
        <Card.Body>
          In `horizontal` orientation the Media slot sits at the logical start (LTR: left,
          RTL: right) and the body fills the remaining width.
        </Card.Body>
        <Card.Footer>Cataloged 2025-12-01</Card.Footer>
      </div>
    </Card>
  );
}
