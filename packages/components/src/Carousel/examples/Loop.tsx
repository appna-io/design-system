import { Carousel, Div } from '@apx-ui/ds';

export default function Loop() {
  return (
    <Carousel ariaLabel="Loop carousel" loop>
      {['One', 'Two', 'Three', 'Four'].map((label, i) => (
        <Carousel.Slide key={label}>
          <Div display="flex" alignItems="center" justifyContent="center" className="h-40 rounded-md bg-bg-subtle text-xl font-semibold">
            {label} ({i + 1} of 4) — Prev/Next wraps around
          </Div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}