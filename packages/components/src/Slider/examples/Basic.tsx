import { Slider } from '@apx-ui/ds';

export default function Basic() {
  return (
    <div className="w-72">
      <Slider aria-label="Volume" defaultValue={50} />
    </div>
  );
}
