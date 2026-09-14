import { Div, Parallax, Typography } from '@apx-ui/ds';

/**
 * `speed` is clamped to ±0.1, and the clamp is enforced rather than documented.
 *
 * The third layer below asks for `0.5` — five times the ceiling — and renders identically to the
 * one asking for `0.1`. A template cannot opt out of the bound.
 */
export default function SpeedCeiling() {
  return (
    <Div className="space-y-4">
      {[
        { speed: -0.03, note: 'subtle — the house default region' },
        { speed: 0.1, note: 'the maximum' },
        { speed: 0.5, note: 'asks for 0.5, gets 0.1' },
      ].map(({ speed, note }) => (
        <Div key={note} className="relative h-24 overflow-hidden rounded-lg bg-primary-subtle">
          <Parallax speed={speed} className="absolute inset-0">
            <Div className="h-full w-full bg-primary/20" />
          </Parallax>
          <Div className="relative flex h-full items-center px-4">
            <Typography variant="bodySmall" color="foreground.muted">
              speed={speed} — {note}
            </Typography>
          </Div>
        </Div>
      ))}
    </Div>
  );
}
