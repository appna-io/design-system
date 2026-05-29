import { Carousel } from 'apx-ds';

const items = Array.from({ length: 8 }, (_, i) => i + 1);

export default function Responsive() {
  return (
    <Carousel
      ariaLabel="Responsive carousel"
      slidesPerView={{ base: 1, sm: 2, md: 3, lg: 4 }}
      gap={3}
    >
      {items.map((n) => (
        <Carousel.Slide key={n}>
          <div className="flex h-32 items-center justify-center rounded-md border border-border bg-bg-default text-lg font-semibold">
            Slide {n}
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
