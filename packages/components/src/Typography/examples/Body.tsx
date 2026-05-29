import { Div, Typography } from '@apx-ui/ds';

export default function Body() {
  return (
    <Div display="flex" flexDirection="column" gap={3} maxWidth={520}>
      <Typography variant="bodyLarge">
        Body large is for lead paragraphs — the opening statement of an article or the hero
        copy on a marketing page. Slightly larger and looser line height.
      </Typography>
      <Typography variant="body">
        Body is the default. Use it for the body of any text-heavy surface. Line height is
        comfortable for reading, and the size matches the page&apos;s baseline.
      </Typography>
      <Typography variant="bodySmall">
        Body small is for secondary information that should still be fully legible — form
        helper text, footnotes, and dense table cells.
      </Typography>
    </Div>
  );
}
