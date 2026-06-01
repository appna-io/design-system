import { Checkbox, Div } from '@apx-ui/ds';

export default function Variants() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Checkbox variant="solid" defaultChecked>
        Solid (default)
      </Checkbox>
      <Checkbox variant="outline" defaultChecked>
        Outline
      </Checkbox>
      <Checkbox variant="soft" defaultChecked>
        Soft
      </Checkbox>
    </Div>
  );
}