import { Div, Marquee, Typography } from '@apx-ui/ds';

const BRANDS = ['Northwind', 'Acme', 'Contoso', 'Initech', 'Umbrella', 'Globex', 'Soylent'];

/**
 * The canonical use: a trust band under a hero. `fade` is what keeps it from reading as a
 * clipped list — logos dissolve at both edges instead of being cut in half by the container.
 */
export default function LogoBand() {
  return (
    <Div className="bg-bg-subtle py-8">
      <Marquee speed="slow" gap={16} fade>
        {BRANDS.map((brand) => (
          <Typography
            key={brand}
            variant="bodyLarge"
            weight="semibold"
            color="foreground.subtle"
            letterSpacing="tight"
          >
            {brand}
          </Typography>
        ))}
      </Marquee>
    </Div>
  );
}
