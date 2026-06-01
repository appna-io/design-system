import { Carousel, Div, Typography } from '@apx-ui/ds';

const products = [
  { name: 'Linen Tee', price: '$34', color: 'bg-sky-100' },
  { name: 'Denim Jacket', price: '$129', color: 'bg-indigo-100' },
  { name: 'Wool Beanie', price: '$22', color: 'bg-rose-100' },
  { name: 'Canvas Tote', price: '$45', color: 'bg-emerald-100' },
  { name: 'Trail Cap', price: '$28', color: 'bg-amber-100' },
  { name: 'Crew Socks', price: '$12', color: 'bg-violet-100' },
];

export default function ProductLane() {
  return (
    <Carousel ariaLabel="Featured products" slidesPerView={3} gap={3}>
      {products.map((p) => (
        <Carousel.Slide key={p.name}>
          <Div display="flex" flexDirection="column" gap="2">
            <Div className={`h-32 rounded-md ${p.color}`} aria-hidden="true" />
            <Typography variant="bodySmall" weight="medium">
              {p.name}
            </Typography>
            <Typography variant="bodySmall" color="fg.muted">
              {p.price}
            </Typography>
          </Div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}