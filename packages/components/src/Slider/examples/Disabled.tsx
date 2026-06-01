import { Div, Slider } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <Div display="flex" flexDirection="column" gap="6" className="w-72">
      <Slider aria-label="Disabled single" disabled defaultValue={40} />
      <Slider
        aria-label="Disabled range"
        mode="range"
        disabled
        defaultValue={[20, 70]}
      />
    </Div>
  );
}