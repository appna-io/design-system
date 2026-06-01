import { Button, Card, Div } from '@apx-ui/ds';

export default function FooterAlignment() {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      {(['start', 'center', 'end', 'between'] as const).map((align) => (
        <Card key={align} variant="outline">
          <Card.Header title={`align="${align}"`} subtitle="Footer alignment" />
          <Card.Body>Footer reads `align` and lays children out with flex utilities.</Card.Body>
          <Card.Footer align={align}>
            <Button variant="ghost" size="sm">
              Cancel
            </Button>
            <Button size="sm">Save</Button>
          </Card.Footer>
        </Card>
      ))}
    </Div>
  );
}