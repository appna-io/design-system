import { Carousel } from 'apx-ds';

const colors = [
  ['#fef3c7', '#fcd34d'],
  ['#dbeafe', '#60a5fa'],
  ['#dcfce7', '#4ade80'],
  ['#fce7f3', '#f472b6'],
  ['#ede9fe', '#a78bfa'],
];

export default function ImageGallery() {
  return (
    <Carousel
      ariaLabel="Gallery"
      ariaRoleDescription="gallery"
      snap="center"
      size="lg"
    >
      {colors.map(([bg, accent], i) => (
        <Carousel.Slide key={i} ariaLabel={`Photo ${i + 1} of ${colors.length}`}>
          <div
            className="flex h-64 items-center justify-center rounded-lg text-2xl font-semibold"
            style={{ background: `linear-gradient(135deg, ${bg}, ${accent})` }}
            aria-hidden="true"
          >
            Photo {i + 1}
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
