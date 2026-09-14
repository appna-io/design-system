import { Badge, Button, Card, Div, Input, Surface, Typography } from '@apx-ui/ds';

/**
 * The CTA band. `tone="primary"` fills the region with the brand role and re-points the surface
 * tokens at it, so the ink becomes the role's authored `contrast` colour.
 *
 * Read the markup inside and note what is *not* there: no colour, no `onDark` prop, no inline
 * `style`. The chip, the field and both buttons are written exactly as they would be on a white
 * page. `color="neutral"` is the light control — the tone points the neutral role at the brand's
 * contrast slot, which is the whole reason this tone exists.
 */
export default function BrandBand() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      <Surface as="section" tone="primary" className="rounded-lg p-6">
        <Div display="flex" flexDirection="column" gap="4">
          <Badge variant="soft" color="neutral" shape="pill" size="sm">
            Get started
          </Badge>

          <Typography variant="h4">Ready when you are</Typography>
          <Typography color="fg.muted">
            Muted body copy on a brand fill. The fade is shallower than an inverted band&rsquo;s — a
            brand colour is a mid-tone, so there is less contrast headroom to spend.
          </Typography>

          <Div display="flex" gap="2" alignItems="center" className="flex-wrap">
            <Input placeholder="you@example.com" aria-label="Email" variant="solid" />
            <Button color="neutral">Start free</Button>
            <Button variant="outline" color="neutral">
              Book a demo
            </Button>
            {/* Status colours deliberately do not follow the tone — this stays red. */}
            <Button variant="ghost" color="danger">
              Cancel
            </Button>
          </Div>

          {/* Nest an inverted surface to get the light card back inside the band: it captures the
              band's current ink and ground — which are now the contrast slot and the fill — and
              swaps them. No third tone needed. */}
          <Surface tone="inverted" className="rounded-md p-4">
            <Card variant="outline">
              <Card.Body>
                <Typography variant="bodySmall">
                  A light card inside the brand band, via a nested `tone=&quot;inverted&quot;`.
                </Typography>
              </Card.Body>
            </Card>
          </Surface>
        </Div>
      </Surface>

      <Surface as="section" tone="secondary" className="rounded-lg p-6">
        <Typography variant="overline">tone=&quot;secondary&quot;</Typography>
        <Typography variant="h4" className="mt-2">
          The same band, on the other brand role
        </Typography>
      </Surface>
    </Div>
  );
}
