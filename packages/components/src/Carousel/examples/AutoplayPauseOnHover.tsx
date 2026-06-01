import { Carousel, Div, Typography } from '@apx-ui/ds';

export default function AutoplayPauseOnHover() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Typography variant="bodySmall" color="fg.muted">
        Hover the carousel to pause auto-advance, focus to pause too. Click the play/pause button
        to keep autoplay sticky.
      </Typography>
      <Carousel
        ariaLabel="Autoplay pauses on hover/focus"
        autoplay
        autoplayInterval={3000}
        pauseOnHover
        pauseOnFocus
        loop
      >
        {['Alpha', 'Beta', 'Gamma', 'Delta'].map((label) => (
          <Carousel.Slide key={label}>
            <Div display="flex" alignItems="center" justifyContent="center" className="h-40 rounded-md bg-bg-subtle text-2xl font-semibold">
              {label}
            </Div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </Div>
  );
}