import { Avatar, Carousel } from '@apx-ui/ds';

const testimonials = [
  {
    name: 'Maya R.',
    role: 'Staff engineer',
    body: '"The keyboard story alone made the migration worth it — every overlay just works."',
  },
  {
    name: 'Jordan K.',
    role: 'Design lead',
    body: '"Tokens, recipes, theming — finally one mental model my whole team can hold."',
  },
  {
    name: 'Sam P.',
    role: 'Accessibility specialist',
    body: '"Components ship with axe-zero out of the box. We caught fewer regressions in QA."',
  },
];

export default function TestimonialCarousel() {
  return (
    <Carousel ariaLabel="Testimonials" snap="center">
      {testimonials.map((t) => (
        <Carousel.Slide key={t.name}>
          <figure className="flex h-48 flex-col items-center justify-center gap-3 rounded-md border border-border bg-bg-default px-8 text-center">
            <blockquote className="text-base text-fg-default">{t.body}</blockquote>
            <figcaption className="flex items-center gap-2 text-xs text-fg-muted">
              <Avatar name={t.name} size="sm" />
              <span>
                <span className="font-medium text-fg-default">{t.name}</span> · {t.role}
              </span>
            </figcaption>
          </figure>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
