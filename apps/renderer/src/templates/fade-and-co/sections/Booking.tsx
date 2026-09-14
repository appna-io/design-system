'use client';

import { useState, type SyntheticEvent } from 'react';
import { Phone } from '@apx-ui/icons';
import { Button, Card, Div, Field, Input, Select, Surface, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { barbers, booking, contact, formatPrice, services } from '../data';

/**
 * The booking band: the pitch on an inverted `Surface`, the form on a bone `Card` lifted over it.
 *
 * That split started as a workaround — `Field`, `Input` and `Select` painted their label, border
 * and text from the light form-control roles with no on-dark variant, so floating the form on its
 * own light surface was the only honest way to get a dark section. Surface removed the
 * constraint, and the split stayed because it is the better layout: the form is the one thing on
 * this page you are meant to act on, and lifting it onto a light card is what makes it read that
 * way. It is now a design decision rather than a dodge.
 *
 * The nesting is the DS doing the work — two inversions cancel, so the card sits in a *second*
 * `tone="inverted"` and comes out light again, without a single token being named here.
 * Counter-intuitively it is NOT `tone="default"`: that means "inherit the ambient palette", which
 * inside a dark band is the dark one. See the note filed against `Surface`.
 *
 * Submission is a client-side no-op with a real success state — there is no backend behind a
 * gallery template — but the fields are wired properly: native `required` on the text inputs,
 * and the submit button stays disabled until a service is picked, since `Select`'s hidden input
 * is not covered by native form validation.
 */
export function Booking() {
  const [service, setService] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: SyntheticEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <Surface
      as="section"
      id="book"
      tone="inverted"
      className="relative overflow-hidden py-20 lg:py-28"
    >
      <Div
        decorative
        gradient={{
          type: 'linear',
          from: 'secondary.active',
          to: 'primary.main',
          position: 'bottom-right',
          toStop: '55%',
        }}
      />

      <Div className="relative mx-auto grid w-full max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8">
        <Div>
          <SectionHeading eyebrow={booking.eyebrow} title={booking.title} body={booking.body} />

          <Div className="mt-8 flex flex-wrap items-center gap-3">
            <Typography variant="body" color="foreground.muted">
              {booking.footnote}
            </Typography>
            <Typography
              actLike="a"
              href={contact.phone.href}
              variant="body"
              weight="semibold"
              className="inline-flex items-center gap-2 rounded-sm transition hover:opacity-80"
            >
              <Phone size={18} />
              {contact.phone.label}
            </Typography>
          </Div>
        </Div>

        <Surface tone="inverted">
          <Card variant="solid" shape="square" size="lg" className="bg-bg-paper shadow-xl">
            <Card.Body>
              {submitted ? (
                <Typography
                  variant="bodyLarge"
                  weight="medium"
                  className="block py-8"
                  aria-live="polite"
                >
                  {booking.confirmation}
                </Typography>
              ) : (
                <Div
                  as="form"
                  onSubmit={handleSubmit}
                  aria-label="Booking request"
                  className="flex flex-col gap-5"
                >
                  <Field label={booking.nameLabel} required>
                    <Input name="name" required placeholder={booking.namePlaceholder} />
                  </Field>

                  <Field label={booking.phoneLabel} required>
                    <Input
                      type="tel"
                      name="phone"
                      required
                      placeholder={booking.phonePlaceholder}
                    />
                  </Field>

                  <Field label={booking.serviceLabel} required>
                    <Select
                      name="service"
                      value={service}
                      onValueChange={setService}
                      placeholder={booking.servicePlaceholder}
                      fullWidth
                    >
                      <Select.Trigger />
                      <Select.Content>
                        {services.map((item) => (
                          <Select.Item key={item.id} value={item.id}>
                            {item.name} · {formatPrice(item.price)}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Field>

                  <Field label={booking.barberLabel}>
                    <Select
                      name="barber"
                      defaultValue={booking.anyBarber.value}
                      placeholder={booking.barberPlaceholder}
                      fullWidth
                    >
                      <Select.Trigger />
                      <Select.Content>
                        <Select.Item value={booking.anyBarber.value}>
                          {booking.anyBarber.label}
                        </Select.Item>
                        {barbers.map((barber) => (
                          <Select.Item key={barber.id} value={barber.id}>
                            {barber.name}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                  </Field>

                  <Button
                    type="submit"
                    size="lg"
                    color="secondary"
                    fullWidth
                    disabled={!service}
                    className="mt-2"
                  >
                    {booking.submitLabel}
                  </Button>
                </Div>
              )}
            </Card.Body>
          </Card>
        </Surface>
      </Div>
    </Surface>
  );
}
