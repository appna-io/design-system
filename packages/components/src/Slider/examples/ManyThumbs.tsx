import { Slider } from '@apx-ui/ds';

export default function ManyThumbs() {
  return (
    <div className="w-80 pt-10">
      <Slider
        mode="range"
        aria-label="EQ bands"
        defaultValue={[10, 30, 60, 90]}
        minStepsBetweenThumbs={5}
        showValueLabel="hover"
        getThumbAriaLabel={(i) => `Band ${i + 1}`}
      />
    </div>
  );
}
