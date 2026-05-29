import { Checkbox } from '@apx-ui/ds';

export default function Disabled() {
  return (
    <div className="flex flex-col gap-2">
      <Checkbox disabled>Disabled, unchecked</Checkbox>
      <Checkbox disabled defaultChecked>
        Disabled, checked
      </Checkbox>
      <Checkbox disabled indeterminate>
        Disabled, indeterminate
      </Checkbox>
    </div>
  );
}
