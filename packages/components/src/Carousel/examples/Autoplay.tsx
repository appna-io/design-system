import { Carousel } from 'apx-ds';

export default function Autoplay() {
  return (
    <Carousel
      ariaLabel="Autoplay carousel"
      autoplay
      autoplayInterval={3500}
      loop
      liveRegionPoliteness="polite"
    >
      {['First', 'Second', 'Third'].map((label) => (
        <Carousel.Slide key={label}>
          <div className="flex h-40 items-center justify-center rounded-md bg-bg-subtle text-2xl font-semibold">
            {label}
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
