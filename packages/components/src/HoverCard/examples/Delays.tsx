import { HoverCard } from '@apx-ui/ds';

/**
 * Three delay profiles for the same card so Ahmad can feel the difference. HoverCard ships with
 * patient defaults (`openDelay=700` / `closeDelay=300`) — heavier than Tooltip because the
 * content is richer. Snappy is closer to Tooltip; default matches GitHub/Twitter UX research.
 */
export default function Delays() {
  return (
    <div className="flex flex-col items-start gap-3">
      <p className="text-sm text-fg-muted">
        Hover each link to compare the delay profiles.
      </p>
      <div className="flex flex-wrap items-center gap-6 text-sm">
        <HoverCard openDelay={150} closeDelay={150}>
          <HoverCard.Trigger>
            <a href="#snappy" className="text-primary underline">
              Snappy (150 / 150)
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content size="sm">Tooltip-like timing.</HoverCard.Content>
        </HoverCard>

        <HoverCard openDelay={700} closeDelay={300}>
          <HoverCard.Trigger>
            <a href="#default" className="text-primary underline">
              Default (700 / 300)
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content size="sm">
            HoverCard&rsquo;s default — patient, dismisses noise from incidental cursor sweeps.
          </HoverCard.Content>
        </HoverCard>

        <HoverCard openDelay={1200} closeDelay={500}>
          <HoverCard.Trigger>
            <a href="#patient" className="text-primary underline">
              Patient (1200 / 500)
            </a>
          </HoverCard.Trigger>
          <HoverCard.Content size="sm">
            Long-form / heavy content — only fires on deliberate dwell.
          </HoverCard.Content>
        </HoverCard>
      </div>
    </div>
  );
}
