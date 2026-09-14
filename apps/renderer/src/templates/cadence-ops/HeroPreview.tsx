import { Avatar, Badge, Card, Div, Progress, Typography } from '@apx-ui/ds';

import { completionPercent, heroPreview } from './data';

/**
 * The product shot — assembled from DS primitives instead of a screenshot.
 *
 * Two reasons it is built rather than dropped in as an image. A PNG would not re-skin when the
 * theme changes, so the one element on the page that is supposed to *be* the product would be
 * the one element that ignores the brand. And a landing page for a dashboard is the honest
 * place to prove the DS can build a dashboard: `Card`, `Progress`, `Avatar` and `Badge` doing
 * the same job here that they would do in the real app.
 *
 * It lives at the template root rather than inside `sections/` because the hero and the
 * `product` tabs both frame it, and a section that imported another section would break the
 * gallery's rule that sections never depend on each other.
 */
export function HeroPreview() {
  return (
    <Card variant="elevated" size="lg" className="w-full bg-bg-paper">
      <Card.Body>
        <Div className="flex items-start justify-between gap-4">
          <Div>
            {/* `as="span"`, not a heading — and the same applies to every label below.
                This is a *fictional dashboard inside a product shot*: chrome in a picture, not a
                section of this document. As headings they sat directly under the page's `h1` and
                skipped h2 entirely, so a screen reader navigating by heading landed inside the
                mockup as though it were part of the page. Visual sizes are unchanged; only the
                outline is. */}
            <Typography size="h4" weight="semibold" className="block text-base">
              {heroPreview.boardTitle}
            </Typography>
            <Div className="mt-1.5 flex items-center gap-2">
              <Div aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
              <Typography variant="caption" color="foreground.subtle">
                {heroPreview.boardMeta}
              </Typography>
            </Div>
          </Div>

          <Div className="flex -space-x-2">
            {heroPreview.crews.map((crew) => (
              <Avatar key={crew.id} name={crew.lead} size="sm" ring="primary" />
            ))}
          </Div>
        </Div>

        <Div className="mt-6 grid grid-cols-3 gap-3">
          {heroPreview.stats.map((stat) => (
            <Div key={stat.label} className="rounded-xl bg-bg-subtle p-3">
              <Typography
                as="span"
                variant="h3"
                weight="bold"
                fontFamily="display"
                letterSpacing="tight"
                className="block text-2xl"
              >
                {stat.value}
              </Typography>
              <Typography variant="caption" color="foreground.subtle" className="mt-0.5 block">
                {stat.label}
              </Typography>
            </Div>
          ))}
        </Div>

        {/* Same reasoning as the board title above: a column label inside the mockup, not a
            section of this document. */}
        <Typography
          as="span"
          variant="caption"
          weight="semibold"
          transform="upper"
          letterSpacing="wider"
          color="foreground.subtle"
          className="mt-7 block"
        >
          {heroPreview.crewsTitle}
        </Typography>

        <Div as="ul" className="mt-3 flex flex-col gap-4">
          {heroPreview.crews.map((crew) => {
            const percent = completionPercent(crew.jobsDone, crew.jobsTotal);
            const complete = crew.jobsDone === crew.jobsTotal;

            return (
              <Div as="li" key={crew.id}>
                <Div className="flex items-center justify-between gap-3">
                  <Typography as="span" variant="bodySmall" weight="medium">
                    {crew.name}
                  </Typography>
                  {complete ? (
                    <Badge variant="soft" color="success" shape="pill" size="sm">
                      Done
                    </Badge>
                  ) : (
                    <Typography as="span" variant="caption" color="foreground.subtle">
                      {crew.jobsDone}/{crew.jobsTotal} jobs
                    </Typography>
                  )}
                </Div>
                <Progress
                  value={percent}
                  size="sm"
                  color={complete ? 'success' : 'primary'}
                  className="mt-2"
                  aria-label={`${crew.name}: ${crew.jobsDone} of ${crew.jobsTotal} jobs closed`}
                />
              </Div>
            );
          })}
        </Div>
      </Card.Body>
    </Card>
  );
}
