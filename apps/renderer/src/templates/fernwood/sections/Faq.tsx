import { Accordion, Div, SectionHeading } from '@apx-ui/ds';

import { faqSection, faqs } from '../content';

/**
 * FAQ. `Accordion` in `collapsible` single mode — a storefront FAQ is scanned, not read, and
 * leaving several panels open at once turns the section back into the wall of text the accordion
 * exists to avoid.
 *
 * No reveal on the items themselves. The heading reveals and the list does not: an accordion whose
 * rows animate in competes with the row that expands when you click it, and the click is the
 * motion that carries meaning here.
 */
export function Faq() {
  return (
    <Div as="section">
      <Div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading intro={faqSection} align="center" />

        <Div className="mt-12">
          <Accordion type="single" collapsible variant="outline">
            {faqs.map((faq) => (
              <Accordion.Item key={faq.id} value={faq.id}>
                <Accordion.Trigger>{faq.question}</Accordion.Trigger>
                <Accordion.Content>{faq.answer}</Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion>
        </Div>
      </Div>
    </Div>
  );
}
