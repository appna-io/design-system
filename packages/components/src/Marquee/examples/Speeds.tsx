import { Div, Marquee, Typography } from '@apx-ui/ds';

const ITEMS = ['— slow enough to read', '— fast enough to notice', '— ambient, not urgent'];

/**
 * The three named speeds are seconds-per-cycle (40 / 25 / 14), a deliberately different scale
 * from the `motion.duration` interaction tokens — those are sub-second and would strobe here.
 */
export default function Speeds() {
  return (
    <Div className="space-y-6">
      {(['slow', 'normal', 'fast'] as const).map((speed) => (
        <Div key={speed} className="space-y-2">
          <Typography variant="bodySmall" color="foreground.subtle">
            speed=&quot;{speed}&quot;
          </Typography>
          <Marquee speed={speed} gap={12} fade>
            {ITEMS.map((item) => (
              <Typography key={item} variant="body" color="foreground.muted">
                {item}
              </Typography>
            ))}
          </Marquee>
        </Div>
      ))}
    </Div>
  );
}
