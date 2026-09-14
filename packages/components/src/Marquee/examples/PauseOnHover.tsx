import { Card, Marquee, Typography } from '@apx-ui/ds';

const QUOTES = [
  'Shipped in a week, not a quarter.',
  'The theme swap took one line.',
  'Our designers stopped filing tickets.',
];

/**
 * `pauseOnHover` belongs on tracks whose items are *interactive or readable* — here, quotes a
 * user wants to finish. On a purely decorative logo band it is the wrong affordance: it invites
 * a hover that does nothing useful.
 */
export default function PauseOnHover() {
  return (
    <Marquee pauseOnHover speed="slow" gap={6} fade>
      {QUOTES.map((quote) => (
        <Card key={quote} className="w-72 shrink-0">
          <Card.Body>
            <Typography variant="body">{quote}</Typography>
          </Card.Body>
        </Card>
      ))}
    </Marquee>
  );
}
