import { Card, Div } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card size="sm">
        <Card.Header title="Small" subtitle="Compact density" />
        <Card.Body>p-3 across the board. Good for sidebars + grids.</Card.Body>
      </Card>
      <Card size="md">
        <Card.Header title="Medium" subtitle="Default" />
        <Card.Body>p-4 across the board. The Goldilocks default.</Card.Body>
      </Card>
      <Card size="lg">
        <Card.Header title="Large" subtitle="Roomy" />
        <Card.Body>p-6 across the board. Hero sections + marketing.</Card.Body>
      </Card>
    </Div>
  );
}