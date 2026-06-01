import { Div, Radio, RadioGroup, type RadioSize } from '@apx-ui/ds';

const SIZES: readonly RadioSize[] = ['sm', 'md', 'lg'];

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="6">
      {SIZES.map((size) => (
        <RadioGroup key={size} size={size} defaultValue="a" aria-label={`Size ${size}`}>
          <Radio value="a">Size {size}</Radio>
          <Radio value="b">Option B</Radio>
        </RadioGroup>
      ))}
    </Div>
  );
}