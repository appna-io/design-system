import { Card, Div } from '@apx-ui/ds';

export default function Colors() {
  return (
    <Div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {(['neutral', 'primary', 'success', 'warning', 'danger', 'info'] as const).map((color) => (
        <Card key={color} color={color} hoverable selected>
          <Card.Header
            title={color.charAt(0).toUpperCase() + color.slice(1)}
            subtitle="Selected + hoverable"
          />
          <Card.Body>
            The colored ring + hover border come from `color`. Body content stays neutral on
            purpose — colored backgrounds shout for attention.
          </Card.Body>
        </Card>
      ))}
    </Div>
  );
}