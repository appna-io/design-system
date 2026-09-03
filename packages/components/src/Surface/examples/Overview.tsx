import { Button, Card, Div, Divider, Surface, Typography } from '@apx-ui/ds';

/**
 * The same markup, twice — once on the ambient ground and once inverted. Nothing inside either
 * band opts in: the heading, the body copy, the divider, the card and the buttons all read the
 * tokens they always read. Only what those tokens resolve to has changed.
 */
export default function Overview() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Surface as="section" className="rounded-lg border border-border p-6">
        <Band label="tone=&quot;default&quot;" />
      </Surface>

      <Surface as="section" tone="inverted" className="rounded-lg p-6">
        <Band label="tone=&quot;inverted&quot;" />
      </Surface>
    </Div>
  );
}

function Band({ label }: { label: string }) {
  return (
    <Div display="flex" flexDirection="column" gap="4">
      <Typography variant="overline">{label}</Typography>
      <Typography variant="h4">Roasted to order, shipped Tuesdays</Typography>
      <Typography color="fg.muted">
        Muted body copy, a hairline, and a card — none of which know which ground they are on.
      </Typography>

      <Divider />

      <Card>
        <Card.Body>
          <Typography variant="bodySmall">A card picks up the ground too.</Typography>
        </Card.Body>
      </Card>

      <Div display="flex" gap="2" alignItems="center">
        {/* `neutral` is the surface role, so it inverts with the surface — this is the light
            button on a dark band that the DS previously could not express. */}
        <Button color="neutral">Subscribe</Button>
        {/* Brand and status colours deliberately do NOT invert: they must stay recognisable. */}
        <Button variant="outline" color="primary">
          Learn more
        </Button>
        <Button variant="ghost" color="danger">
          Unsubscribe
        </Button>
      </Div>
    </Div>
  );
}
