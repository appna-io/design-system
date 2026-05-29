import { Radio, RadioGroup, type RadioSize } from 'apx-ds';

const SIZES: readonly RadioSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  return (
    <div className="flex flex-col gap-6">
      {SIZES.map((size) => (
        <RadioGroup key={size} size={size} defaultValue="a" aria-label={`Size ${size}`}>
          <Radio value="a">Size {size}</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ))}
    </div>
  );
}
