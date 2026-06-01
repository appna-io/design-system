import { Carousel, Div } from '@apx-ui/ds';

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
          <Div display="flex" alignItems="center" justifyContent="center" className="h-40 rounded-md bg-bg-subtle text-2xl font-semibold">
            {label}
          </Div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}