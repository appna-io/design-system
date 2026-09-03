import { Div, Image, Typography } from '@apx-ui/ds';

import { SectionHeading } from '../SectionHeading';
import { story } from '../data';

/**
 * Image-left, prose-right. Kept as a plain two-column grid rather than a horizontal `Card`,
 * because the source has no card surface here — the image and the text sit directly on the
 * page background, and wrapping them in a Card would invent a border the original never had.
 */
export function Story() {
  return (
    <Div
      as="section"
      id="about"
      className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
    >
      <Div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Div className="overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={story.image.src}
            alt={story.image.alt}
            aspectRatio="4/3"
            fit="cover"
            fullWidth
            fallback={<Div className="h-full w-full bg-neutral-subtle" />}
          />
        </Div>

        <Div>
          <SectionHeading title={story.title} body={story.body} />

          <Div className="mt-6 flex flex-col gap-4">
            {story.paragraphs.map((paragraph) => (
              <Typography
                key={paragraph.slice(0, 24)}
                variant="body"
                color="fg.muted"
                lineHeight="relaxed"
              >
                {paragraph}
              </Typography>
            ))}
          </Div>
        </Div>
      </Div>
    </Div>
  );
}
