import { useState } from 'react';
import { Button, Carousel, Div, Typography } from '@apx-ui/ds';

export default function ControlledIndex() {
  const [index, setIndex] = useState(0);
  const slides = ['Intro', 'Setup', 'Build', 'Ship'];

  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Carousel
        ariaLabel="Controlled carousel"
        index={index}
        onIndexChange={(next) => setIndex(next)}
      >
        {slides.map((label) => (
          <Carousel.Slide key={label}>
            <Div display="flex" alignItems="center" justifyContent="center" className="h-40 rounded-md bg-bg-subtle text-2xl font-semibold">
              {label}
            </Div>
          </Carousel.Slide>
        ))}
      </Carousel>
      <Div display="flex" className="flex-wrap items-center gap-2">
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
        <Typography as="span" variant="caption" color="fg.muted">
          External state: index = {index}
        </Typography>
      </Div>
    </Div>
  );
}