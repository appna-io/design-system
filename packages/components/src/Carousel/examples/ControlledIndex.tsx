import { useState } from 'react';
import { Button, Carousel } from '@apx-ui/ds';

export default function ControlledIndex() {
  const [index, setIndex] = useState(0);
  const slides = ['Intro', 'Setup', 'Build', 'Ship'];

  return (
    <div className="flex flex-col gap-3">
      <Carousel
        ariaLabel="Controlled carousel"
        index={index}
        onIndexChange={(next) => setIndex(next)}
      >
        {slides.map((label) => (
          <Carousel.Slide key={label}>
            <div className="flex h-40 items-center justify-center rounded-md bg-bg-subtle text-2xl font-semibold">
              {label}
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>
      <div className="flex flex-wrap items-center gap-2">
        {slides.map((label, i) => (
          <Button
            key={label}
            size="sm"
            variant={index === i ? 'solid' : 'outline'}
            onClick={() => setIndex(i)}
          >
            {label}
          </Button>
        ))}
        <span className="text-xs text-fg-muted">External state: index = {index}</span>
      </div>
    </div>
  );
}
