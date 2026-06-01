import { Div, Slider } from '@apx-ui/ds';

export default function Basic() {
  return (
    <Div className="w-72">
      <Slider aria-label="Volume" defaultValue={50} />
    </Div>
  );
}