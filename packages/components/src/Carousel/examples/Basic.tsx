import { Carousel } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Carousel ariaLabel="Basic carousel">
      {[1, 2, 3, 4, 5].map((n) => (
        <Carousel.Slide key={n}>
          <div className="flex h-40 items-center justify-center rounded-md bg-bg-subtle text-2xl font-semibold">
            Slide {n}
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
