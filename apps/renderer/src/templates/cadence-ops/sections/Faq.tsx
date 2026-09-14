import { Accordion, Div, SectionHeading } from '@apx-ui/ds';

import { faqSection, faqs } from '../data';

/**
 * `type="single" collapsible` — one answer open at a time, and the open one can be closed
 * again. Multi-open would let a visitor build a wall of text that buries the question they were
 * actually on, and a non-collapsible single leaves them with no way back to the plain list.
 *
 * No item is open by default: opening one for them asserts which question they came with.
 */
export function Faq() {
  return (
    <Div
      as="section"
      id="faq"
      className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <SectionHeading eyebrow={faqSection.eyebrow} title={faqSection.title} />

      <Accordion type="single" collapsible className="mt-12">
        {faqs.map((faq) => (
          <Accordion.Item key={faq.id} value={faq.id}>
            <Accordion.Trigger>{faq.question}</Accordion.Trigger>
            <Accordion.Content>{faq.answer}</Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion>
    </Div>
  );
}
