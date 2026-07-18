import { Div, Image, Typography } from '@apx-ui/ds';

export default function Fallback() {
  return (
    <Div className="max-w-sm space-y-2">
      <Image
        src="https://example.invalid/broken.jpg"
        alt="Gallery item that failed to load"
        aspectRatio="4/3"
        radius="lg"
        fallback={
          <Div className="flex h-full w-full items-center justify-center bg-bg-subtle">
            <Typography variant="caption" color="fg.muted">Image unavailable</Typography>
          </Div>
        }
      />
      <Typography variant="caption" color="fg.muted">
        A broken source renders the `fallback` slot in the same box — same radius, same ratio,
        no layout shift, no browser broken-image glyph.
      </Typography>
    </Div>
  );
}
