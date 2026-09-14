import { Div, Image, Typography } from '@apx-ui/ds';

/**
 * The "show the back of the shirt" pattern: a second source cross-fades in on hover.
 *
 * The second image is fetched on the **first hover**, never on mount. A grid of 24 products would
 * otherwise double its image payload for an interaction most visitors never perform — and that
 * cost is invisible in review, which is why the lazy path is the default rather than an option.
 */
export default function HoverSrc() {
  return (
    <Div className="grid grid-cols-2 gap-6">
      <Div className="space-y-2">
        <Image
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop&q=80"
          alt="Heavyweight tee, front"
          hoverSrc="https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop&q=80&v=hoversrc"
          aspectRatio="4/5"
          radius="lg"
          hoverEffect="zoom"
        />
        <Typography variant="bodySmall" color="foreground.muted">
          Hover to see the alternate view
        </Typography>
      </Div>
    </Div>
  );
}
