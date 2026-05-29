import { Carousel } from 'apx-ds';

export default function Loop() {
  return (
    <Carousel ariaLabel="Loop carousel" loop>
      {['One', 'Two', 'Three', 'Four'].map((label, i) => (
        <Carousel.Slide key={label}>
          <div className="flex h-40 items-center justify-center rounded-md bg-bg-subtle text-xl font-semibold">
            {label} ({i + 1} of 4) — Prev/Next wraps around
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
