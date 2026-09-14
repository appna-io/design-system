import { Badge, Div, Marquee, Typography } from '@apx-ui/ds';

const TAGS = ['react', 'typescript', 'tailwind', 'motion', 'a11y', 'tokens'];

/**
 * `direction` is the VISUAL travel direction and is not mirrored under RTL — a band the designer
 * asked to drift left drifts left in every locale.
 */
export default function Directions() {
  return (
    <Div className="space-y-6">
      {(['left', 'right'] as const).map((direction) => (
        <Div key={direction} className="space-y-2">
          <Typography variant="bodySmall" color="foreground.subtle">
            direction=&quot;{direction}&quot;
          </Typography>
          <Marquee direction={direction} gap={4}>
            {TAGS.map((tag) => (
              <Badge key={tag} variant="soft" color="neutral" shape="pill">
                {tag}
              </Badge>
            ))}
          </Marquee>
        </Div>
      ))}
    </Div>
  );
}
