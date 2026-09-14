import { Marquee, Typography } from '@apx-ui/ds';

const WORDS = ['Design', 'Build', 'Ship', 'Measure', 'Iterate', 'Repeat'];

export default function Basic() {
  return (
    <Marquee>
      {WORDS.map((word) => (
        <Typography key={word} variant="bodyLarge" color="foreground.muted">
          {word}
        </Typography>
      ))}
    </Marquee>
  );
}
