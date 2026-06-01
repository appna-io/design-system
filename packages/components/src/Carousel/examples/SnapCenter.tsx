import { Carousel, Div } from '@apx-ui/ds';

export default function SnapCenter() {
  return (
    <Carousel ariaLabel="Center-snap carousel" snap="center" slidesPerView={3} gap={4}>
      {Array.from({ length: 7 }, (_, i) => (
        <Carousel.Slide key={i}>
          <Div display="flex" alignItems="center" justifyContent="center" className="h-40 rounded-md border border-border bg-bg-default text-lg font-semibold">
            #{i + 1}
          </Div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}