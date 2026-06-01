import { Checkbox, Div } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <Div display="flex" flexDirection="column" gap="2">
      <Checkbox disabled>Disabled, unchecked</Checkbox>
      <Checkbox disabled defaultChecked>
        Disabled, checked
      </Checkbox>
      <Checkbox disabled indeterminate>
        Disabled, indeterminate
      </Checkbox>
    </Div>
  );
}