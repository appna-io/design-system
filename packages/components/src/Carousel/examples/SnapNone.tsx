import { Carousel } from 'apx-ds';

export default function SnapNone() {
  return (
    <Carousel ariaLabel="Free-scroll lane" snap="none" slidesPerView={3} gap={3}>
      {Array.from({ length: 10 }, (_, i) => (
        <Carousel.Slide key={i}>
          <div className="flex h-32 items-center justify-center rounded-md bg-bg-subtle text-sm font-medium">
            Item {i + 1}
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
