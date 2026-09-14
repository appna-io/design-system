import { Check } from '@apx-ui/icons';
import { Card, Div, SectionHeading, Tabs, Typography } from '@apx-ui/ds';

import { productSection, productTabs } from '../data';

/**
 * The three-capability section, as `Tabs` rather than three stacked feature blocks.
 *
 * Tabs is the right shape here because dispatch, timesheets and payroll are alternatives a
 * visitor picks between by role — a dispatcher and a payroll manager each want one panel — not
 * a sequence they read in order. Three stacked blocks would force both of them past the other
 * two.
 *
 * `activation="manual"` on purpose: automatic activation swaps the panel on arrow-key focus,
 * which is fine for a small settings pane and hostile when each panel is a screenful of
 * marketing copy a keyboard user is trying to move past.
 */
export function Product() {
  return (
    <Div
      as="section"
      id="product"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <SectionHeading
        eyebrow={productSection.eyebrow}
        title={productSection.title}
        body={productSection.body}
      />

      <Tabs
        defaultValue={productTabs[0]?.id}
        variant="pills"
        size="lg"
        alignment="center"
        activation="manual"
        aria-label="Product capabilities"
        className="mt-12"
      >
        <Tabs.List>
          {productTabs.map((tab) => (
            <Tabs.Trigger key={tab.id} value={tab.id}>
              {tab.label}
            </Tabs.Trigger>
          ))}
        </Tabs.List>

        {productTabs.map((tab) => (
          <Tabs.Panel key={tab.id} value={tab.id}>
            <Card variant="outline" size="lg" className="mt-8 bg-bg-paper">
              <Card.Body>
                <Div className="grid gap-8 lg:grid-cols-2 lg:gap-14">
                  <Div>
                    <Typography
                      as="h3"
                      variant="h3"
                      weight="bold"
                      letterSpacing="tight"
                      fontFamily="display"
                      className="text-2xl sm:text-3xl"
                    >
                      {tab.title}
                    </Typography>
                    <Typography
                      variant="bodyLarge"
                      color="foreground.muted"
                      lineHeight="relaxed"
                      className="mt-4"
                    >
                      {tab.body}
                    </Typography>
                  </Div>

                  <Div as="ul" className="flex flex-col gap-4 lg:pt-2">
                    {tab.points.map((point) => (
                      <Div as="li" key={point} className="flex items-start gap-3">
                        <Div
                          aria-hidden
                          className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-subtle text-primary-main"
                        >
                          <Check size={14} />
                        </Div>
                        <Typography variant="body" lineHeight="relaxed">
                          {point}
                        </Typography>
                      </Div>
                    ))}
                  </Div>
                </Div>
              </Card.Body>
            </Card>
          </Tabs.Panel>
        ))}
      </Tabs>
    </Div>
  );
}
