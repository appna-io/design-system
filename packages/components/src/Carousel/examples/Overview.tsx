import { Carousel, Div } from '@apx-ui/ds';

const photos = [
  { label: 'Golden Gate Bridge', bg: '#fef3c7', accent: '#f59e0b' },
  { label: 'Lake Tahoe', bg: '#dbeafe', accent: '#3b82f6' },
  { label: 'Redwood Trail', bg: '#dcfce7', accent: '#22c55e' },
  { label: 'Big Sur Coast', bg: '#fce7f3', accent: '#ec4899' },
];

/**
 * Quick-review demo: accessible image carousel with prev/next controls and dot indicators.
 */
export default function Overview() {
  return (
    <Carousel ariaLabel="California photo gallery" ariaRoleDescription="gallery" snap="center">
      {photos.map((photo, i) => (
        <Carousel.Slide
          key={photo.label}
          ariaLabel={`${photo.label}, photo ${i + 1} of ${photos.length}`}
        >
          <Div
            display="flex"
            alignItems="center"
            justifyContent="center"
            className="h-60 rounded-lg text-lg font-semibold"
            style={{ background: `linear-gradient(135deg, ${photo.bg}, ${photo.accent})` }}
            aria-hidden="true"
          >
            {photo.label}
          </Div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}