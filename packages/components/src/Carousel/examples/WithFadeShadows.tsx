import { Carousel } from 'apx-ds';

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
          <div className="flex h-16 items-center justify-center rounded-full border border-border bg-bg-default px-4 text-sm font-medium">
            {t}
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
