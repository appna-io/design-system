import { Button, Card, Carousel } from '@apx-ui/ds';

const features = [
  { title: 'Realtime sync', body: 'See changes from collaborators as they happen.' },
  { title: 'Version history', body: 'Every save is a recoverable checkpoint.' },
  { title: 'Branching', body: 'Try an idea without affecting your main canvas.' },
];

export default function WithCardContent() {
  return (
    <Carousel ariaLabel="Feature carousel" slidesPerView={2} gap={3}>
      {features.map((f) => (
        <Carousel.Slide key={f.title}>
          <Card>
            <Card.Header title={f.title} />
            <Card.Body>{f.body}</Card.Body>
            <Card.Footer align="end">
              <Button size="sm" variant="outline">
                Learn more
              </Button>
            </Card.Footer>
          </Card>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
