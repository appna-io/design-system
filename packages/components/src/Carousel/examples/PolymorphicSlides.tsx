import { Carousel, Typography } from '@apx-ui/ds';

const articles = [
  { href: '#a', title: 'Why scroll-snap is enough', tag: 'engineering' },
  { href: '#b', title: 'Designing for reduced motion', tag: 'a11y' },
  { href: '#c', title: 'A budget for every component', tag: 'perf' },
];

export default function PolymorphicSlides() {
  return (
    <Carousel ariaLabel="Article carousel" slidesPerView={2} gap={3}>
      {articles.map((a) => (
        <Carousel.Slide key={a.href} asChild>
          <a
            href={a.href}
            className="block h-32 rounded-md border border-border bg-bg-default p-4 text-sm no-underline transition-colors hover:bg-bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Typography variant="caption" color="fg.muted" className="uppercase tracking-wide">
              {a.tag}
            </Typography>
            <Typography variant="body" weight="semibold" color="fg.default" className="mt-1">
              {a.title}
            </Typography>
          </a>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}