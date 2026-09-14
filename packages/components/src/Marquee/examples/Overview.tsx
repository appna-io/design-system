import { Badge, Div, Marquee, Typography } from '@apx-ui/ds';

const BRANDS = ['Northwind', 'Acme', 'Contoso', 'Initech', 'Umbrella', 'Globex'];
const TAGS = ['react', 'typescript', 'tailwind', 'motion', 'a11y'];

export default function Overview() {
  return (
    <Div className="space-y-8">
      <Marquee speed="slow" gap={16} fade>
        {BRANDS.map((brand) => (
          <Typography key={brand} variant="bodyLarge" weight="semibold" color="foreground.subtle">
            {brand}
          </Typography>
        ))}
      </Marquee>

      <Marquee direction="right" speed="fast" gap={4} fade pauseOnHover>
        {TAGS.map((tag) => (
          <Badge key={tag} variant="soft" color="primary" shape="pill">
            {tag}
          </Badge>
        ))}
      </Marquee>
    </Div>
  );
}
