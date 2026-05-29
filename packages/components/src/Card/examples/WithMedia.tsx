import { Card } from '@apx-ui/ds';

export default function WithMedia() {
  return (
    <Card className="max-w-sm" variant="elevated">
      <Card.Media
        src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=640&q=80"
        alt="Forest canopy"
        aspectRatio="16/9"
      />
      <Card.Header title="Forest canopy" subtitle="Pacific Northwest, USA" />
      <Card.Body>
        A wide-angle frame of a moss-blanketed canopy lit from above by morning sun.
      </Card.Body>
    </Card>
  );
}
