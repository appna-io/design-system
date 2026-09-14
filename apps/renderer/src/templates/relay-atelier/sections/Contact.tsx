import { ArrowUpRight } from '@apx-ui/icons';
import { Reveal, Section, SectionHeading, Typography } from '@apx-ui/ds';

import { sectionEyebrow } from '../sectionEyebrow';

import { contact } from '../content';

/**
 * The close, and the third and last appearance of the accent — on the email address, which is the
 * one thing on the page anyone is meant to click.
 *
 * No CTA band, no brand fill, no button. Every other template in the gallery ends on a coloured
 * band with a solid button; this one ends on an email address set at headline size on the same
 * paper as everything else. On a near-monochrome page a filled band would be the loudest thing on
 * it, which would make the loudest thing a *container* rather than the work — and a four-person
 * studio that shouts at you in the last section has undone its own argument.
 */
export function Contact() {
  return (
    <Section as="section" id="contact">
      <Reveal preset="fade">
        <SectionHeading
          eyebrow={sectionEyebrow('04', contact.eyebrow)}
          eyebrowVariant="plain"
          titleMeasure="md"
          title={contact.title}
          body={contact.body}
        />

        <Typography
          actLike="a"
          href={contact.email.href}
          variant="displayXl"
          color="secondary.main"
          className="group mt-14 inline-flex items-start gap-4 break-all transition hover:text-fg"
        >
          {contact.email.label}
          <ArrowUpRight
            size={28}
            className="mt-3 shrink-0 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
          />
        </Typography>

        <Typography variant="bodySmall" color="fg.subtle" className="mt-10 block">
          {contact.location}
        </Typography>
      </Reveal>
    </Section>
  );
}
