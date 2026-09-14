import { Badge, Div, Marquee, Typography } from '@apx-ui/ds';

const SHORT = ['One', 'Two', 'Three'];
const LONG = [
  'Northwind',
  'Acme',
  'Contoso',
  'Initech',
  'Umbrella',
  'Globex',
  'Soylent',
  'Cyberdyne',
  'Tyrell',
  'Wayland',
];

/**
 * The rate model, demonstrated.
 *
 * Both bands are `speed="slow"`. The long one holds three times the content, so it takes three
 * times as long to complete a cycle — and travels at exactly the same physical speed. Under a
 * seconds-per-cycle model these two would visibly disagree, which is why every band on a site
 * built that way ends up with its own hand-tuned duration.
 */
export default function SameRate() {
  return (
    <Div className="space-y-6">
      <Div className="space-y-2">
        <Typography variant="bodySmall" color="foreground.subtle">
          3 items — short track, short cycle
        </Typography>
        <Marquee speed="slow" gap={6}>
          {SHORT.map((item) => (
            <Badge key={item} variant="soft" color="primary" shape="pill">
              {item}
            </Badge>
          ))}
        </Marquee>
      </Div>

      <Div className="space-y-2">
        <Typography variant="bodySmall" color="foreground.subtle">
          10 items — long track, long cycle, identical speed
        </Typography>
        <Marquee speed="slow" gap={6}>
          {LONG.map((item) => (
            <Badge key={item} variant="soft" color="secondary" shape="pill">
              {item}
            </Badge>
          ))}
        </Marquee>
      </Div>
    </Div>
  );
}
