import { Carousel } from 'apx-ds';

export default function AutoplayPauseOnHover() {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-fg-muted">
        Hover the carousel to pause auto-advance, focus to pause too. Click the play/pause button
        to keep autoplay sticky.
      </p>
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
            <div className="flex h-40 items-center justify-center rounded-md bg-bg-subtle text-2xl font-semibold">
              {label}
            </div>
          </Carousel.Slide>
        ))}
      </Carousel>
    </div>
  );
}
