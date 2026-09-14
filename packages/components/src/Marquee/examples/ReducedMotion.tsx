import { Badge, Div, Marquee, Typography } from '@apx-ui/ds';

const ITEMS = ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'];

/**
 * The two presentations side by side. `reduceMotion` forces the branch so the difference is
 * visible without changing an OS setting.
 *
 * The reduced track is a real scroll region, not a frozen animation — drag or shift-scroll it and
 * every item is still reachable. Freezing would have made the content *less* accessible than not
 * animating at all, which is why this branch changes the markup rather than just the class.
 */
export default function ReducedMotion() {
  return (
    <Div className="space-y-6">
      {[false, true].map((reduced) => (
        <Div key={String(reduced)} className="space-y-2">
          <Typography variant="bodySmall" color="foreground.subtle">
            {reduced ? 'prefers-reduced-motion: reduce — scrollable, static' : 'default — animated'}
          </Typography>
          <Marquee reduceMotion={reduced} gap={4} fade>
            {ITEMS.map((item) => (
              <Badge key={item} variant="soft" color="primary" shape="pill">
                {item}
              </Badge>
            ))}
          </Marquee>
        </Div>
      ))}
    </Div>
  );
}
