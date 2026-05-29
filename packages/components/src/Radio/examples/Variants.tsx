import { Radio, RadioGroup } from '@apx-ui/ds';

export default function Variants() {
  return (
    <div className="flex flex-col gap-6">
      <RadioGroup variant="solid" defaultValue="a" aria-label="Solid">
        <Radio value="a">Solid (default)</Radio>
        <Radio value="b">Option B</Radio>
      </RadioGroup>
      <RadioGroup variant="outline" defaultValue="a" aria-label="Outline">
        <Radio value="a">Outline</Radio>
        <Radio value="b">Option B</Radio>
      </RadioGroup>
      <RadioGroup variant="soft" defaultValue="a" aria-label="Soft">
        <Radio value="a">Soft</Radio>
        <Radio value="b">Option B</Radio>
      </RadioGroup>
    </div>
  );
}
