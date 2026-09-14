import { Div, Image } from '@apx-ui/ds';

/**
 * `lift` moves the whole frame — 4px of rise plus an elevation step — so the tile reads as
 * picked up rather than as an image responding inside a fixed box. The right choice when the
 * image *is* the card; `zoom` is the right choice when it sits inside one.
 */
export default function HoverLift() {
  return (
    <Div className="grid grid-cols-2 gap-6">
      {['4/3', '4/3'].map((ratio, i) => (
        <Image
          key={i}
          src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=750&fit=crop&q=80"
          alt={`Lookbook frame ${i + 1}`}
          aspectRatio={ratio}
          radius="lg"
          shadow="sm"
          hoverEffect="lift"
        />
      ))}
    </Div>
  );
}
