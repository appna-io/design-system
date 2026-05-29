import { Carousel } from 'apx-ds';

export default function CustomIndicators() {
  return (
    <Carousel ariaLabel="Carousel with custom indicators" showIndicators="never">
      <Carousel.Viewport>
        <Carousel.Track>
          {['Inbox', 'Drafts', 'Sent', 'Archive'].map((label) => (
            <Carousel.Slide key={label}>
              <div className="flex h-40 items-center justify-center rounded-md bg-bg-subtle text-2xl font-semibold">
                {label}
              </div>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Indicators variant="numbers" align="center" />
    </Carousel>
  );
}
