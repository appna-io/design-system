import { useRef, useState } from 'react';
import { Button, Carousel, Div, Typography, type CarouselRef } from '@apx-ui/ds';

export default function ProgrammaticRef() {
  const ref = useRef<CarouselRef>(null);
  const [index, setIndex] = useState(0);

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Carousel
        ariaLabel="Programmatic carousel"
        ref={ref}
        onIndexChange={(next) => setIndex(next)}
      >
        {Array.from({ length: 6 }, (_, i) => (
          <Carousel.Slide key={i}>
            <Div display="flex" alignItems="center" justifyContent="center" className="h-40 rounded-md bg-bg-subtle text-2xl font-semibold">
              Slide {i + 1}
            </Div>
          </Carousel.Slide>
        ))}
      </Carousel>
      <Div display="flex" className="flex-wrap items-center gap-2">
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
        <Typography as="span" variant="caption" color="fg.muted">
          ref.getIndex() = {index}
        </Typography>
      </Div>
    </Div>
  );
}