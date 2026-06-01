import { Carousel, Div } from '@apx-ui/ds';

export default function SnapNone() {
  return (
    <Carousel ariaLabel="Free-scroll lane" snap="none" slidesPerView={3} gap={3}>
      {Array.from({ length: 10 }, (_, i) => (
        <Carousel.Slide key={i}>
          <Div display="flex" alignItems="center" justifyContent="center" className="h-32 rounded-md bg-bg-subtle text-sm font-medium">
            Item {i + 1}
          </Div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}