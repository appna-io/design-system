import { Carousel } from 'apx-ds';

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
          <div className="flex flex-col gap-2">
            <div className={`h-32 rounded-md ${p.color}`} aria-hidden="true" />
            <div className="text-sm font-medium">{p.name}</div>
            <div className="text-sm text-fg-muted">{p.price}</div>
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
