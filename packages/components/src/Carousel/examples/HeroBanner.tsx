import { Carousel } from '@apx-ui/ds';

const banners = [
  { title: 'Summer Collection', subtitle: 'Bright colors, breezy fabrics.', bg: 'from-amber-400 to-orange-500' },
  { title: 'Workwear Refresh', subtitle: 'Built for long days.', bg: 'from-slate-700 to-slate-900' },
  { title: 'Run Club Edit', subtitle: 'New gear, faster splits.', bg: 'from-emerald-400 to-teal-600' },
];

export default function HeroBanner() {
  return (
    <Carousel ariaLabel="Hero banner" snap="center" size="lg">
      {banners.map((b) => (
        <Carousel.Slide key={b.title}>
          <div
            className={`flex h-56 flex-col items-start justify-end gap-1 rounded-md bg-gradient-to-br ${b.bg} p-6 text-white`}
          >
            <h3 className="text-2xl font-bold">{b.title}</h3>
            <p className="text-sm opacity-90">{b.subtitle}</p>
          </div>
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}
