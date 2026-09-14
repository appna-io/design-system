import { Div, Image, Parallax, Typography } from '@apx-ui/ds';

/**
 * The correct shape: the **backdrop** is wrapped, the copy is not.
 *
 * The container clips (`overflow-hidden`) and the layer is oversized, so the drift never exposes
 * an edge. Scroll the page to see it — the image lags the surface slightly while the heading stays
 * locked to it.
 */
export default function Basic() {
  return (
    <Div className="relative h-[420px] overflow-hidden rounded-xl">
      <Parallax speed={-0.08} className="absolute inset-x-0 -top-[10%] h-[120%]">
        <Image
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1400&h=900&fit=crop&q=80"
          alt=""
          fit="cover"
          className="h-full"
        />
      </Parallax>

      <Div className="absolute inset-0 bg-neutral/40" aria-hidden />

      <Div className="relative flex h-full items-end p-8">
        <Typography as="h2" variant="display" weight="bold" className="text-neutral-contrast">
          The copy does not move
        </Typography>
      </Div>
    </Div>
  );
}
