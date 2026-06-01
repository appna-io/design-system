import { Checkbox, Div } from '@apx-ui/ds';

export default function Sizes() {
  return (
    <Div display="flex" flexDirection="column" gap="3">
      <Checkbox size="sm" defaultChecked>
        Small
      </Checkbox>
      <Checkbox size="md" defaultChecked>
        Medium
      </Checkbox>
      <Checkbox size="lg" defaultChecked>
        Large
      </Checkbox>
    </Div>
  );
}