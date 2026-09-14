import { Div, Image, Typography } from '@apx-ui/ds';

const PRODUCTS = [
  { id: 'a', name: 'Heavyweight tee', src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop&q=80' },
  { id: 'b', name: 'Oxford shirt', src: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&h=750&fit=crop&q=80' },
  { id: 'c', name: 'Crew sweat', src: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop&q=80' },
];

/**
 * The product-grid case. Hover any tile: the image scales to 1.04 inside a frame that does not
 * move, so the two tiles beside it stay exactly where they are.
 *
 * Scaling a bare `<img>` instead would grow the element and shove its neighbours sideways on
 * every hover — the reason the zoom needs a frame at all.
 */
export default function HoverZoom() {
  return (
    <Div className="grid grid-cols-3 gap-4">
      {PRODUCTS.map((product) => (
        <Div key={product.id} className="space-y-2">
          <Image
            src={product.src}
            alt={product.name}
            aspectRatio="4/5"
            radius="lg"
            hoverEffect="zoom"
          />
          <Typography variant="bodySmall" color="foreground.muted">
            {product.name}
          </Typography>
        </Div>
      ))}
    </Div>
  );
}
