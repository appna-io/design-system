import { Card } from 'apx-ds';

export default function AsChild() {
  return (
    <Card asChild hoverable color="primary" className="max-w-sm">
      <a href="https://example.com" rel="noreferrer">
        <Card.Header title="Card as a link" subtitle="asChild={true}" />
        <Card.Body>
          When the `asChild` prop is set, the wrapped anchor keeps its native link role and
          keyboard semantics — Card still contributes its frame, hover lift, and focus styling.
        </Card.Body>
      </a>
    </Card>
  );
}
