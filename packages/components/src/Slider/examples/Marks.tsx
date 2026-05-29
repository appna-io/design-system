import { Slider } from '@apx-ui/ds';

export default function Marks() {
  return (
    <div className="w-72 pb-6">
      <Slider
        aria-label="Brightness"
        defaultValue={50}
        step={25}
        marks={[
          { value: 0, label: '0' },
          { value: 25, label: '25' },
          { value: 50, label: 'Mid' },
          { value: 75, label: '75' },
          { value: 100, label: '100' },
        ]}
      />
    </div>
  );
}
