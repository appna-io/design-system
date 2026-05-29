import { Carousel } from '@apx-ui/ds';

export default function SnapCenter() {
  return (
    <Carousel ariaLabel="Center-snap carousel" snap="center" slidesPerView={3} gap={4}>
      {Array.from({ length: 7 }, (_, i) => (
        <Carousel.Slide key={i}>
          <div className="flex h-40 items-center justify-center rounded-md border border-border bg-bg-default text-lg font-semibold">
            #{i + 1}
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
