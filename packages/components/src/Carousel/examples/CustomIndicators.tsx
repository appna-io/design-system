import { Carousel, Div } from '@apx-ui/ds';

export default function CustomIndicators() {
  return (
    <Carousel ariaLabel="Carousel with custom indicators" showIndicators="never">
      <Carousel.Viewport>
        <Carousel.Track>
          {['Inbox', 'Drafts', 'Sent', 'Archive'].map((label) => (
            <Carousel.Slide key={label}>
              <Div display="flex" alignItems="center" justifyContent="center" className="h-40 rounded-md bg-bg-subtle text-2xl font-semibold">
                {label}
              </Div>
            </Carousel.Slide>
          ))}
        </Carousel.Track>
      </Carousel.Viewport>
      <Carousel.Indicators variant="numbers" align="center" />
    </Carousel>
  );
}