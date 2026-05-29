import { Slider } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <div className="w-72 flex flex-col gap-6">
      <Slider aria-label="Disabled single" disabled defaultValue={40} />
      <Slider
        aria-label="Disabled range"
        mode="range"
        disabled
        defaultValue={[20, 70]}
      />
    </div>
  );
}
