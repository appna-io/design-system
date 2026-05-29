import { Slider } from '@apx-ui/ds';

export default function Vertical() {
  return (
    <div className="h-48 flex gap-8 items-center justify-center">
      <Slider aria-label="Bass" orientation="vertical" defaultValue={40} />
      <Slider aria-label="Mid" orientation="vertical" defaultValue={60} />
      <Slider aria-label="Treble" orientation="vertical" defaultValue={75} />
    </div>
  );
}
