import { useRef, useState } from 'react';
import { Button, Carousel, type CarouselRef } from 'apx-ds';

export default function ProgrammaticRef() {
  const ref = useRef<CarouselRef>(null);
  const [index, setIndex] = useState(0);

  return (
    <div className="flex flex-col gap-3">
      <Carousel
        ariaLabel="Programmatic carousel"
        ref={ref}
        onIndexChange={(next) => setIndex(next)}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <Carousel.Slide key={i}>
            <div className="flex h-40 items-center justify-center rounded-md bg-bg-subtle text-2xl font-semibold">
              Slide {i + 1}
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={() => ref.current?.prev()}>
          Prev (ref.prev)
        </Button>
        <Button size="sm" onClick={() => ref.current?.next()}>
          Next (ref.next)
        </Button>
        <Button size="sm" variant="outline" onClick={() => ref.current?.scrollTo(0)}>
          Jump to first
        </Button>
        <Button size="sm" variant="outline" onClick={() => ref.current?.scrollTo(5)}>
          Jump to last
        </Button>
        <span className="text-xs text-fg-muted">ref.getIndex() = {index}</span>
      </div>
    </div>
  );
}
