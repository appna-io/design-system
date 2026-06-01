import { Carousel, Div } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Carousel ariaLabel="Basic carousel">
      {[1, 2, 3, 4, 5].map((n) => (
        <Carousel.Slide key={n}>
          <Div display="flex" alignItems="center" justifyContent="center" className="h-40 rounded-md bg-bg-subtle text-2xl font-semibold">
            Slide {n}
          </Div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}