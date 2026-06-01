import { Checkbox, Div } from '@apx-ui/ds';

export default function Shapes() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Checkbox shape="square" defaultChecked>
        Square (default)
      </Checkbox>
      <Checkbox shape="rounded" defaultChecked>
        Rounded
      </Checkbox>
      <Checkbox shape="circle" defaultChecked>
        Circle
      </Checkbox>
    </Div>
  );
}