import { Carousel, Div } from '@apx-ui/ds';

const tags = [
  'Design systems',
  'Accessibility',
  'Performance',
  'Tooling',
  'Architecture',
  'Testing',
  'Docs',
  'DX',
];

export default function WithFadeShadows() {
  return (
    <Carousel ariaLabel="Topic chips" slidesPerView={4} gap={2} showShadows>
      {tags.map((t) => (
        <Carousel.Slide key={t}>
          <Div display="flex" alignItems="center" justifyContent="center" className="h-16 rounded-full border border-border bg-bg-default px-4 text-sm font-medium">
            {t}
          </Div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}