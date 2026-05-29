import { Slider } from 'apx-ds';

export default function Range() {
  return (
    <div className="w-72">
      <Slider
        mode="range"
        aria-label="Price range"
        defaultValue={[20, 80]}
        minStepsBetweenThumbs={5}
      />
    </div>
  );
}
