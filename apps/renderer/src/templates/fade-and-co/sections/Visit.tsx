import type { ReactNode } from 'react';
import { Clock, MapPin, Phone } from '@apx-ui/icons';
import { Div, Divider, Image, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { contact, hours, visit } from '../data';

/**
 * Address, hours and the room. Photo-left / details-right on a plain background — no `Card`,
 * because there is no surface here in the design and wrapping it would invent a border.
 *
 * Hours are a `<dl>`: each row is a range of days and the time it maps to, which is exactly a
 * term and its definition. The address is a real `<address>` element.
 */
export function Visit() {
  return (
    <Div
      as="section"
      id="visit"
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28"
    >
      <Div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Div className="overflow-hidden shadow-lg">
          <Image
            src={visit.image.src}
            alt={visit.image.alt}
            aspectRatio="4/3"
            fit="cover"
            fullWidth
            fallback={<Div className="h-full w-full bg-neutral-subtle" />}
          />
        </Div>

        <Div>
          <SectionHeading eyebrow={visit.eyebrow} title={visit.title} body={visit.body} />

          <Div className="mt-10 grid gap-8 sm:grid-cols-2">
            <Div>
              <DetailTitle icon={<MapPin size={16} />}>{visit.addressTitle}</DetailTitle>
              <Typography
                as="address"
                variant="body"
                color="foreground.muted"
                className="mt-3 block not-italic"
              >
                {visit.address.map((line) => (
                  <Typography key={line} as="span" display="block">
                    {line}
                  </Typography>
                ))}
              </Typography>

              <DetailTitle icon={<Phone size={16} />} className="mt-8">
                {visit.contactTitle}
              </DetailTitle>
              <Div className="mt-3 flex flex-col gap-1">
                <ContactLink href={contact.phone.href}>{contact.phone.label}</ContactLink>
                <ContactLink href={`mailto:${contact.email}`}>{contact.email}</ContactLink>
              </Div>
            </Div>

            <Div>
              <DetailTitle icon={<Clock size={16} />}>{visit.hoursTitle}</DetailTitle>
              <Div as="dl" className="mt-3 flex flex-col">
                {hours.map((row) => (
                  <Div key={row.days} className="flex items-baseline justify-between gap-4 py-1.5">
                    <Typography as="dt" variant="bodySmall" color="foreground.muted">
                      {row.days}
                    </Typography>
                    <Typography as="dd" variant="bodySmall" weight="medium">
                      {row.time}
                    </Typography>
                  </Div>
                ))}
              </Div>
            </Div>
          </Div>

          <Divider className="mt-8" />

          <Typography variant="bodySmall" color="foreground.subtle" className="mt-6 block">
            {visit.walkIns}
          </Typography>
        </Div>
      </Div>
    </Div>
  );
}

/** Icon + uppercase label, repeated three times in this section's detail columns. */
function DetailTitle({
  icon,
  children,
  className,
}: {
  icon: ReactNode;
  children: string;
  className?: string;
}) {
  return (
    <Div className={`flex items-center gap-2 text-secondary-main ${className ?? ''}`}>
      {icon}
      <Typography
        as="h3"
        variant="caption"
        weight="semibold"
        transform="upper"
        letterSpacing="wider"
        color="secondary.main"
      >
        {children}
      </Typography>
    </Div>
  );
}

function ContactLink({ href, children }: { href: string; children: string }) {
  return (
    <Typography
      actLike="a"
      href={href}
      variant="body"
      color="foreground.muted"
      className="rounded-sm transition hover:text-secondary-main"
    >
      {children}
    </Typography>
  );
}
