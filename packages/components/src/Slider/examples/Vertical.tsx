import { Div, Slider } from '@apx-ui/ds';

export default function Vertical() {
  return (
    <Div display="flex" alignItems="center" justifyContent="center" gap="8" height={192}>
      <Slider aria-label="Bass" orientation="vertical" defaultValue={40} />
      <Slider aria-label="Mid" orientation="vertical" defaultValue={60} />
      <Slider aria-label="Treble" orientation="vertical" defaultValue={75} />
    </Div>
  );
}