import { Accordion, Reveal, SectionHeading, Section } from '@apx-ui/ds';

import { faqIntro, faqs } from '../content';

/**
 * `type="single" collapsible` — one answer open at a time, and the open one can be closed again.
 * Nothing open by default: opening one for the reader asserts which question they came with.
 *
 * The questions are the ones that decide whether someone can come at all — refunds, recordings,
 * step-free access, a quiet room, babies — rather than the marketing FAQ that answers "why should
 * I attend". A reader who needs the accessible-toilet answer should not have to email for it.
 */
export function Faq() {
  return (
    <Section as="section" id="faq" rhythm="compact" width="narrow">
      <Reveal>
        <SectionHeading
          eyebrowStyle={{ variant: 'solid', shape: 'square' }}
          eyebrow={faqIntro.eyebrow}
          title={faqIntro.title}
        />

        <Accordion type="single" collapsible className="mt-12">
          {faqs.map((faq) => (
            <Accordion.Item key={faq.id} value={faq.id}>
              <Accordion.Trigger>{faq.question}</Accordion.Trigger>
              <Accordion.Content>{faq.answer}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
      </Reveal>
    </Section>
  );
}
