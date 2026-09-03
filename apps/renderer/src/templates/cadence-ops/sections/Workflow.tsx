import { Clock, MapPin, Repeat, Zap } from '@apx-ui/icons';
import { Div, Timeline } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { workflowSection, workflowSteps, type FeatureIcon } from '../data';

/**
 * "A week on Cadence", as a horizontal `Timeline` with `responsive` so it folds to vertical
 * below `md` — a four-across strip on desktop, a readable column on a phone, from one prop.
 *
 * `showTimestamps={false}` is the important call: these are stages, not events. Timeline
 * defaults to a relative-time column, which would invent a chronology ("2 days ago") that this
 * content does not have.
 */
const ICONS: Partial<Record<FeatureIcon, typeof Clock>> = {
  clock: Clock,
  mapPin: MapPin,
  repeat: Repeat,
  zap: Zap,
};

export function Workflow() {
  return (
    <Div
      as="section"
      id="workflow"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <SectionHeading
        eyebrow={workflowSection.eyebrow}
        title={workflowSection.title}
        body={workflowSection.body}
      />

      <Div className="mt-14">
        <Timeline
          orientation="horizontal"
          responsive
          size="md"
          showTimestamps={false}
          items={workflowSteps.map((step) => {
            const Icon = ICONS[step.icon];
            return {
              id: step.id,
              title: step.title,
              description: step.description,
              icon: Icon ? <Icon size={16} /> : undefined,
              active: step.active,
            };
          })}
        />
      </Div>
    </Div>
  );
}
